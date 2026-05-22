# SpeechSprout — Product Specification

## What Is SpeechSprout?

SpeechSprout is a mobile-first, child-facing web app for at-home speech sound practice. Children aged 3–12 who are working with a speech-language pathologist (SLP) can use it to practise their assigned sounds between appointments. The app uses a plant-growing game metaphor: each voice attempt "waters" a plant, which grows across 5 stages from seed to full bloom.

**It is not a diagnostic tool.** It tracks practice behaviour and attempt consistency only.

---

## Problem Statement

Children receiving speech therapy typically see their SLP for 30–60 minutes per week. Research suggests that home practice is critical for progress, but:

1. Parents often don't know how to support practice at home
2. Flashcard-based practice is boring for children
3. Apps that attempt clinical scoring create false expectations and liability
4. Most "speech therapy apps" are either too clinical (adult-facing) or too shallow (just word display)

SpeechSprout targets the gap: **structured, game-like, therapist-complementary home practice** that is genuinely engaging for children without overclaiming clinical validity.

---

## Core Value Proposition

- For children: a fun plant-growing game where your voice makes things happen
- For parents: a guided, structured home-practice routine with easy session notes
- For clinicians: a copyable practice behaviour report for each session cycle

---

## Clinical Framework

SpeechSprout implements a simplified version of motor learning principles used in speech therapy:

- **Massed practice:** 5 attempts per session, quick feedback loop
- **Immediate feedback:** visual + audio confirmation of attempt detected
- **Word-level targets:** practice at single-word level (not isolated phoneme)
- **IPA-based targeting:** each module maps to an IPA target with known visibility and placement
- **Not prescriptive:** the app does not choose targets — parents/clinicians do, by unlocking modules

---

## Feedback Mode Rules

Every speech target has a `feedbackMode` and `visibility` level:

| Target | IPA | Visibility | Feedback Mode | Webcam Used? |
|--------|-----|-----------|---------------|-------------|
| P | /p/ | high | audio_plus_visual | ✅ Yes |
| M | /m/ | high | audio_plus_visual | ✅ Yes |
| OO | /uː/ | high | audio_plus_visual | ✅ Yes |
| F | /f/ | partial | audio_plus_visual | ✅ Yes (limited) |
| S | /s/ | low | audio_only | ❌ Never |
| K | /k/ | low | audio_only | ❌ Never |

**Rule:** If `visibility === "low"`, the webcam MUST NOT be used. Period. Tongue position cannot be reliably observed through a front-facing camera for alveolar and velar targets. Using webcam for these would produce meaningless feedback and erode trust.

---

## Audio-First Logic

For `audio_only` targets, the entire practice interaction is voice-driven:

1. Word appears (e.g., "sun")
2. Child says the word
3. App detects voice attempt via Web Audio API (volume threshold + duration)
4. Water drops animate upward
5. Plant stage increases
6. Next word appears

The app does NOT attempt to classify whether the sound was produced correctly. It only detects that a voice attempt was made. The feedback is "I heard you!" framing, not "You got it right."

---

## Visual Biofeedback Rules (for visual targets only)

For targets like /p/ and /oo/, the webcam tracks lip position using MediaPipe:

- For /p/: lip closure (mouthWidth + mouthOpening approaching zero)
- For /oo/: lip rounding (low mouthWidth + elevated roundnessRatio)

The score displayed to parents in the clinician summary is called "visual movement score" — never "pronunciation score" or "accuracy score."

**Child-facing label:** "shape" (on the ScoreRing)
**Parent/clinician label:** "avg visual score" or "visible movement"

The hold duration requirement (2000ms) ensures children maintain the shape rather than just briefly touching it.

---

## Child Flow

```
1. First visit:
   Welcome Page → "Start Practice" → Child Setup (nickname + age) → Adventure Map

2. Returning visit:
   (loads saved profile) → Adventure Map directly

3. Practice session:
   Tap map node → Bottom sheet opens → "Let's go!" → Practice (5 words × voice attempts)
   → Session Complete (celebration + stars) → "Back to Adventure Map"

4. Optional:
   Practice screen → "👁 Guide" → See the Sound (3D mouth guide) → back to Practice
```

---

## Parent Flow

```
1. From Adventure Map:
   "👨‍👩‍👧 Grown-ups" button → Parent Dashboard

2. From Session Complete:
   Expand "👨‍👩‍👧 Grown-up summary" accordion → rate difficulty + add note

3. From Parent Dashboard:
   "📋 Clinician Summary" → select target → copy formatted report text
```

---

## Clinician Flow

The clinician summary is designed to be:
1. Copied from the app by the parent
2. Pasted into an email/message to the SLP

It includes:
- Child nickname and age range
- Target IPA, place, manner, voicing
- Feedback mode (visual vs audio-only)
- Practice dates range
- Session count
- Total attempts and completion rate
- Words practised
- Average hold duration (if visual target)
- Observation paragraph (plain language)
- Parent notes (if any)
- Most recent session difficulty rating
- Suggested discussion point for the next SLP appointment

---

## IPA Target Metadata

Each `SpeechTarget` has:

```typescript
interface SpeechTarget {
  id: string;              // "p", "oo", "s", etc.
  label: string;           // Display label: "P", "OO"
  ipa: string;             // IPA notation: "/p/", "/uː/"
  place: string;           // articulatory place: "bilabial", "alveolar", "velar"
  manner: string;          // "stop", "fricative", "nasal", "approximant"
  voicing: "voiced" | "voiceless";
  visibility: "high" | "partial" | "low";  // camera usefulness
  feedbackMode: "audio_only" | "audio_plus_visual" | "visual_movement_only";
  therapyStage: "establishment" | "word_level";
  exampleWords: string[];  // 5 practice words
  visualCue?: string;      // Child-facing instruction for mouth shape
  parentCue?: string;      // Parent-facing observation tip
  color: string;           // Tailwind color name for theming
  emoji: string;           // Representative emoji
  placementGuideType?: string; // Maps to 3D guide config
}
```

---

## What Is Real vs Simulated

### Real (works with actual hardware):
- Microphone audio capture via Web Audio API
- Volume measurement and waveform visualization
- Attempt detection (sustained volume threshold)
- Webcam video via MediaPipe Face Landmarker
- Lip rounding score computation from facial landmarks
- Hold duration timing
- LocalStorage persistence

### Simulated (demo mode):
- Webcam replaced with animated emoji face (`useDemoMode` hook)
- Audio replaced with sine-wave volume simulation (`useAudioAnalysis(enabled, simulateAttempts=true)`)
- Demo auto-completes after 2400ms
- Visual score oscillates with a sine function, eventually reaching threshold
- No permission prompts in demo mode

### Partially real:
- 3D articulation guide (real Three.js, but anatomy is simplified geometric shapes — not anatomically precise medical model)
- Clinician summary (real data, but observation language is formula-generated, not clinician-reviewed)
- Star system (real attempt count, but star thresholds are arbitrary game mechanics)

---

## localStorage Schema

```
Key: "ss_child_profile"
Value: JSON ChildProfile

Key: "ss_sessions"
Value: JSON array of PracticeSession
```

No user accounts. No server sync. Data lives on device.
