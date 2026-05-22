# SpeechSprout — Audio System Specification

---

## Overview

SpeechSprout uses two audio systems:
1. **Real microphone** (Web Audio API) — live sessions
2. **Simulated audio** (setInterval sine wave) — demo mode

The child-facing UI shows only the VoiceWateringInteraction component. Clinical audio metrics (spectral centroid, HF energy) are computed but shown only in parent/clinician summaries.

---

## `useAudioAnalysis` Hook

**File:** `src/hooks/useAudioAnalysis.ts`

**Signature:**
```typescript
function useAudioAnalysis(
  enabled: boolean,
  simulateAttempts?: boolean
): {
  audioState: AudioAnalysisState;
  resetAttempt: () => void;
}
```

**Constants:**
```typescript
const FFT_SIZE = 64;              // 32 frequency bins
const WAVEFORM_BINS = 32;         // bins returned in waveformData
const ATTEMPT_THRESHOLD = 22;     // raw FFT average (0-255 range) to detect voice
const ATTEMPT_DURATION_MS = 400;  // must sustain above threshold for 400ms
const DEMO_AUTO_TRIGGER_MS = 2400; // demo auto-fires after 2.4 seconds
```

---

## Audio States

### `AudioAnalysisState` Interface

```typescript
interface AudioAnalysisState {
  volume: number;              // 0-100 (raw avg * 2, capped at 100)
  waveformData: number[];      // 32 elements, each 0-100
  spectralCentroid: number;    // normalized spectral centroid 0-100
  highFrequencyEnergy: number; // % energy in upper 1/3 of FFT bins, 0-100
  isAttemptDetected: boolean;  // true = voice attempt confirmed
  attemptDurationMs: number;   // ms voice has been above threshold
  active: boolean;             // mic is streaming
  permissionDenied: boolean;   // permission was rejected
}
```

### State Transitions

```
enabled=false
  → INITIAL_STATE (volume 0, no waveform, inactive)

enabled=true, simulateAttempts=false (real mic)
  → requesting mic...
    → permissionDenied: true if rejected
    → active: true if streaming
    → every RAF frame:
        volume > ATTEMPT_THRESHOLD × duration
        → isAttemptDetected=true when sustained >= 400ms

enabled=true, simulateAttempts=true (demo)
  → active: true immediately
  → volume oscillates with sine wave ~35-57
  → isAttemptDetected=false until 2400ms elapsed
  → isAttemptDetected=true, stays true until resetAttempt()
```

---

## Real Microphone Implementation

```
getUserMedia({ audio: true })
  → AudioContext
    → AnalyserNode (fftSize: 64)
      → MediaStreamSource → Analyser
        → requestAnimationFrame loop:
            getByteFrequencyData(Uint8Array[32])
            rawVol = average of all bins
            volume = min(100, rawVol * 2)
            waveformData = buildWaveform(data)
            spectralCentroid = computeSpectralCentroid(data)
            highFrequencyEnergy = computeHighFrequencyEnergy(data)
            
            if rawVol >= 22:
              track sustained duration
              if duration >= 400ms → isAttemptDetected = true
            else:
              reset aboveThresholdStart
              isAttemptDetected = false
```

### Waveform Building

```typescript
function buildWaveform(data: Uint8Array): number[] {
  // Down-samples 32 FFT bins into 32 display bins (1:1 here)
  // Each bin normalized: (avg / 255) * 100
  return Array.from({ length: 32 }, (_, i) => {
    const start = i * step;
    const slice = data.slice(start, start + step);
    return Math.min(100, Math.round((avg(slice) / 255) * 100));
  });
}
```

### Spectral Centroid

```typescript
function computeSpectralCentroid(data: Uint8Array): number {
  // Weighted average frequency bin position
  // Normalized: centroid_bin / total_bins * 100
  // Low value = bass/low energy, High value = treble/high energy
}
```

### High Frequency Energy

```typescript
function computeHighFrequencyEnergy(data: Uint8Array): number {
  // Energy in bins 21-32 (upper 1/3) as % of total energy
  // Relevant for fricatives (/s/, /f/) vs vowels and stops
}
```

---

## Demo Mode Simulation

```typescript
// setInterval at 80ms
const t = Date.now() / 800;
const base = 35 + Math.sin(t * 1.3) * 22; // oscillates ~13-57

waveformData = Array.from(32 bins, (_, i) => {
  return clamp(sin(t * (1.2 + i * 0.08)) * 22 + base + random()*8, 0, 100)
});
volume = clamp(base + random()*8, 0, 100);

// After 2400ms from activation:
isAttemptDetected = true;  // stays true until resetAttempt()
```

---

## Waveform Behaviour (WaveformViz)

**File:** `src/components/WaveformViz.tsx`

### Idle breathing (mic not active or pre-session):
- 24 bars, each with unique period and phase
- Period: `1.25 + (i % 7) * 0.14` seconds (range: 1.25s – 2.09s)
- Delay: `i * 0.068` seconds
- Height range: `idleBase` to `idlePeak`
  - `idleBase = 3 + abs(sin(i * 0.71)) * 2` (3–5px)
  - `idlePeak = idleBase + 4 + abs(sin(i * 0.43)) * 5` (7–14px)
- This creates an organic, non-mechanical breathing appearance

### Active audio:
- Bar height = `Math.max(4, Math.round(waveformData[i_mapped] * 0.36))`
- Spring transition: stiffness 380, damping 26
- `*0.36` scaling keeps bars visually proportional in 40px container

### Colors:
- `isAttemptDetected`: `#22C55E` (green)
- `volume > 20`: `#F97316` (orange)
- default: `#CBD5E1` (slate-200)
- Color transition: duration 0.22s

---

## Child-Facing Audio Visualisation (VoiceWateringInteraction)

**File:** `src/components/VoiceWateringInteraction.tsx`

### Visual elements (what child sees):

```
[Relative container]
  
  [Water drops — AnimatePresence]
    5 drops, spawned on isAttemptDetected rising edge
    Each: random x offset, random scale
    Animation: y 0→-110px, opacity 1→0, duration 1.1s ease-out
    Auto-removed from state after 1400ms
  
  [Mic circle, 84px]
    Default: orange-500 shadow-orange-200
    isLoud (volume>25): orange-400, scale pulse 1→1.06→1 (0.28s mirror loop)
    isAttemptDetected: green-400, bounce [1, 1.14, 0.97, 1] duration 0.45s
    Emoji inside: 🎤 (default) → 💧 (on attempt)
    
    [Two ring animations while active]
      Ring 1: scale [1, 1.55], opacity [0.55, 0], duration 1.5s, infinite
      Ring 2: scale [1, 1.9], opacity [0.35, 0], duration 1.5s, delay 0.5s, infinite
  
  [WaveformViz in white/90 rounded-2xl container]
  
  [Status text — AnimatePresence key-switched]
    "Get ready…" (default, slate-400)
    "Say 'word' out loud!" (active, orange-500)
    "Your voice watered the sprout! 💧" (attempt detected, green-600)
  
  [Demo badge if isDemoMode]
    "Demo mode — will auto-complete ✨" (text-[10px] slate-400)
```

### Permission denied state:
- Renders amber error card instead of the interaction
- "🎤 Allow microphone to start"
- "Allow microphone access and reload the page to continue."

---

## Voice-to-Water Interaction Flow

The game loop for audio-only targets:

```
1. Phase: "intro"
   Word bubble shows (e.g. "sun")
   "Let's go! 🎤" button visible
   
2. User taps "Let's go!"
   → phase: "listening"
   → useAudioAnalysis(true) activates
   → VoiceWateringInteraction shows
   → Mic starts, rings pulse
   
3. Child speaks
   → volume rises above threshold
   → status: "Say 'sun' out loud!"
   → waveform reacts to voice
   
4. Volume sustained >= 400ms
   → isAttemptDetected = true
   → mic circle turns green + bounces
   → 5 water drops burst upward
   → status: "Your voice watered the sprout! 💧"
   → PracticePage useEffect fires → completeAudioRep()
   
5. completeAudioRep():
   → creates PracticeAttempt { completed: true }
   → plantStage advances (floor(completedCount/5 * 5))
   → PlantIllustration animates to new stage
   → feedbackMsg set: "Great try! 🌟"
   → phase: "rep-complete"
   → green feedback card shows
   
6. After 1800ms → advanceAttempt()
   → resetAttempt() clears isAttemptDetected
   → if attemptNum < 5: next word, phase → "listening"
   → if 5 complete: finishSession()
```

---

## Demo Mode Audio Behaviour

When `isDemoMode = true`:

1. `useAudioAnalysis(enabled, simulateAttempts=true)` is called
2. No microphone permission requested
3. Volume oscillates (sine wave ~35-57)
4. Waveform animates as if voice is present
5. After exactly **2400ms** from activation → `isAttemptDetected = true`
6. This triggers `completeAudioRep()` automatically
7. Rep completes → advances to next word
8. Clock resets → another 2400ms → next attempt
9. All 5 complete → session ends

**Demo mode message:** Small gray text below waveform: "Demo mode — will auto-complete ✨"

---

## Parent/Clinician Audio Metrics

These values are computed but **must not appear in child-facing UI**:

| Metric | Description | Where shown |
|--------|-------------|-------------|
| `spectralCentroid` | Center of spectral mass (0-100) | Clinician summary only (future) |
| `highFrequencyEnergy` | % energy in upper FFT bins | Clinician summary only (future) |
| `attemptDurationMs` | How long voice was above threshold | Internal only |
| `visualScore` | Lip rounding composite (0-100) | Parent dashboard avg, clinician summary |
| `holdDurationMs` | Duration shape was held | Parent dashboard avg, clinician summary |

**Current implementation note:** `spectralCentroid` and `highFrequencyEnergy` are computed in the hook but are NOT currently displayed anywhere in the UI. They are collected for future use in automated quality detection (not diagnostic scoring).

---

## Safe Audio Language

### In child UI (use these):
- "Say it out loud!"
- "Say '[word]' out loud!"
- "I heard you!"
- "Your voice watered the sprout!"
- "Great try!"
- "Keep going!"
- "Your voice is working!"

### In parent/clinician UI (use these):
- "Attempt detected"
- "Audio practice behaviour"
- "Completion rate"
- "Average hold duration"
- "Visual movement score"
- "Consistent voice attempts"

### Never use anywhere:
- "correct" / "incorrect"
- "pronunciation verified"
- "speech detected accurately"
- "pass" / "fail"
- "normal / abnormal speech"
- "spectral centroid" or "high frequency energy" (without clinical context)
- "diagnostic confidence"
- "speech clarity score"
