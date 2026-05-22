# SpeechSprout — Complete Lovable Build Prompt

Paste this entire prompt into Lovable to recreate SpeechSprout from scratch.

---

## Product Summary

Build **SpeechSprout** — a mobile-first, child-facing speech therapy home-practice app for ages 3–12. Children practise specific speech sounds (IPA targets) assigned by their speech-language pathologist. The app uses a playful game metaphor: water your plant by speaking clearly. Each successful voice attempt drops water on a growing plant. The app is **not** a diagnostic tool. It tracks practice behaviour only.

---

## Target Users

- **Primary:** Children aged 3–12 practising at home between SLP appointments
- **Secondary:** Parents/carers supervising practice sessions
- **Tertiary:** Speech-language pathologists receiving exported session summaries

---

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 3.4 (utility-first, no component libraries)
- Framer Motion 12 (all interactions use spring physics)
- `@mediapipe/tasks-vision@0.10.35` (webcam face landmarker, loaded dynamically)
- `@react-three/fiber` + `@react-three/drei` + `three` (3D mouth articulation guide)
- `recharts` (parent dashboard charts)
- No backend. All data in `localStorage`.

---

## Mobile-First App Shell

**Critical:** The entire app lives inside a `max-width: 430px` centered container.

```tsx
// App shell wrapper
<div className="min-h-screen bg-amber-100/70 flex justify-center">
  <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl shadow-amber-200/50 relative overflow-hidden">
    {/* all pages render here */}
  </div>
</div>
```

On desktop this creates a phone-frame effect. Full-width on mobile. Every page uses `min-h-screen` internally but is constrained to 430px.

---

## Locked User Flow

```
Landing Page
    ↓ "Start Practice"
Child Setup (nickname + age range)
    ↓
Adventure Map (game world — main hub)
    ↓ tap module node
Bottom Sheet (module preview — child + parent accordion)
    ↓ "Let's go!"
Practice Game (word → voice → water → plant grows)
    ↓ after 5 attempts
Session Complete (celebration → "Back to Adventure Map")
    (parent accordion: "Grown-up summary")
    ↓ optional
Parent Dashboard → Clinician Summary

Side flow:
Practice → "👁 Guide" button → See the Sound (3D guide)
Adventure Map → "👨‍👩‍👧 Grown-ups" → Parent Dashboard
```

**Returning users:** If `localStorage` has a child profile, skip landing page and open Adventure Map directly.

---

## Screen-by-Screen Requirements

### 1. Landing Page (`WelcomePage`)
- Background: warm gradient `from-amber-50 via-orange-50 to-yellow-50`
- PlantIllustration (stage 4, bloomed) as logo above title
- Title: **SpeechSprout** — "Speech" in orange-500, "Sprout" in green-600, `text-5xl font-black`
- Tagline: "Practise. Grow. Shine! 🌟"
- White card: "Playful speech practice activities designed to complement work with a **speech-language pathologist**."
- 3-icon grid: 🎤 "Say it" / 💧 "Water it" / 🌸 "Grow it"
- Primary CTA: "Start Practice 🌱" (orange-500, rounded-full)
- Secondary CTA: "View Demo" (white with border)
- DisclaimerBanner component below CTAs
- Small print: "Activity targets are selected by a parent or clinician. SpeechSprout does not prescribe therapy."
- All elements stagger in with Framer Motion (`staggerChildren: 0.1`)

### 2. Child Setup Page (`ChildSetupPage`)
- Warm gradient background
- Heading: "Let's get started! 👋"
- Form card (white, rounded-3xl):
  - Nickname input (text field, maxLength 20, `font-black text-lg`)
  - Age range selector: three pill buttons — "3–5 years 🐣", "6–8 years 🌱", "9–12 years 🌻"
  - Selected age range animates to scale 1.06 (Framer Motion spring)
- Continue button: disabled until both fields filled; orange when enabled
- Back link at bottom
- On submit: save `ChildProfile` to localStorage, navigate to Adventure Map

### 3. Adventure Map (`LearningMapPage`) — MUST rebuild from scratch
This is the most important screen. Do NOT use large cards. Use compact circular nodes on a winding path.

**Layout:**
- Header bar: greeting "Hi [name]! 🌱" + stars earned pill + "👨‍👩‍👧 Grown-ups" button (top right)
- Scrollable map area with 5 module nodes
- Background gradient: `from-sky-100 via-green-50 to-amber-50`

**Map nodes:**
- Each node is an 88px circle (`rounded-full`)
- Module emoji centered inside (text-4xl)
- Colored background matching module theme
- Node states:
  - **Current** (first incomplete unlocked module): pulsing ring animation (two rings, scale 1→1.4→0 and 1→1.7→0, repeat infinite)
  - **Completed**: green ✓ badge (absolute, top-right of circle)
  - **Locked/coming soon**: grayscale, 50% opacity, 🔒 icon below emoji
- Below each node: module name (text-[10px] font-black) + 3 stars (⭐⭐⭐, opacity 0.18 for unearned)

**Node positions (zigzag left-right):**
- Node 0: `self-start ml-[10%]` (left side)
- Node 1: `self-end mr-[10%]` (right side)
- Node 2: `self-start ml-[10%]` (left)
- Node 3: `self-end mr-[10%]` (right)
- Node 4: `self-center` (center)

**Path connectors between nodes:**
- SVG: `viewBox="0 0 100 52"`, full width, h-14
- Left→Right path: `M 22 0 C 22 28, 78 28, 78 52`
- Right→Left path: `M 78 0 C 78 28, 22 28, 22 52`
- Stroke: `#FCD34D`, strokeWidth 4, strokeDasharray "7 5", opacity 0.75

**Environment decorations** (absolute positioned, pointer-events-none):
- ☁️ top-right (~top:20px, right:8%)
- 🌻 near node 0 (right:4%, top:70px)
- 🐸 near node 1 (left:5%, top:215px)
- 🍄 near node 2 (right:5%, top:355px)
- ☁️ near node 3 (left:8%, top:430px)
- 🌿 near node 3 (right:6%, top:520px)
- ⭐ near node 4 (left:6%, top:620px)

**Bottom sheet on node tap (INSTEAD OF a separate page):**
- When unlocked node is tapped → bottom sheet slides up (AnimatePresence, spring stiffness 380 damping 38)
- Semi-transparent backdrop (bg-black/30) with exit on tap
- Sheet contents:
  - Handle bar (w-10, h-1, bg-slate-200)
  - Module emoji in colored 64px rounded-2xl tile + name + subtitle
  - "Today's words" section: word chips (rounded-full, module color)
  - **"Let's go! 🌸"** button (orange-500, rounded-full, large)
  - "👨‍👩‍👧 Grown-up details" accordion (collapsed by default):
    - Sound target (IPA)
    - Feedback mode
    - Mouth tip (visualCue)
    - Disclaimer text

**Bottom sheet navigates directly to Practice (no intermediate ModuleIntroPage).**

### 4. See the Sound (`SeeTheSoundPage`)
- 3D interactive mouth cross-section using `@react-three/fiber`
- Accessible from Practice screen via "👁 Guide" button
- Top bar: back button + target label + "Skip →" button
- 3D Canvas (MouthSceneCanvas component, height 270px, draggable/rotatable)
- Canvas shows anatomical model with highlighted regions for the current sound
- Audio-only warning banner if `isInvisibleToCamera` is true
- "For the child" instruction card (bold, friendly language)
- Parent/carer cue (collapsible accordion)
- Anatomy key badges (alveolar ridge / soft palate / lips)
- "Got it — Start Practice! 🌱" CTA
- Disclaimer: "This guide shows placement only. It is not a clinical assessment."

### 5. Practice Game (`PracticePage`) — child-first mini-game
Total 5 attempts per session. Each attempt uses one word from the module's 5-word list (cycling).

**Layout (top to bottom):**
1. **Top bar:** "← Exit" (left) + module name + DEMO badge if demo (center) + "👁 Guide" (right)
2. **Word bubble (HERO):** The current practice word in a rounded card (`rounded-[2.5rem]`, white bg, shadow), `text-5xl font-black`. AnimatePresence spring entrance on word change.
3. **Plant + WaterDrops card:** White rounded-3xl card. PlantIllustration (80px) with AnimatePresence on stage change. WaterDrops (5 💧 icons, filled count tracks completed attempts). Card flashes green ring on rep complete.
4. **Voice interaction area:**
   - For **audio-only targets** (`audio_only` feedbackMode): `VoiceWateringInteraction` component (see below)
   - For **visual targets** (`audio_plus_visual`): ScoreRing (shape score) + feedback text + compact 16:9 camera view
5. **Rep-complete feedback bubble:** Green card "Great try! 🌟" etc. — child-friendly copy only
6. **Start button:** "Let's go! 🎤" — shown only in "intro" phase, hides once listening begins

**Practice phases:** `intro` → `listening` → `rep-complete` → (back to `listening` for next attempt) → `done` (triggers session complete)

**VoiceWateringInteraction component (audio targets):**
- Large pulsing mic circle (84px, orange-500)
- Two expanding ring animations while listening (scale 1→1.55→0 opacity, repeat)
- WaveformViz (24 bars, staggered idle breathing, spring on audio input)
- On attempt detected: mic turns green, 5 water drop emojis burst upward (AnimatePresence, y: 0→-110, opacity fade)
- Status text: "Say 'word' out loud!" → "Your voice watered the sprout! 💧"
- Demo mode: auto-triggers after 2400ms

**Plant growth:** 5 stages (PlantStage 0–4). Stage advances every ~1 completed attempt (floor(completedCount/TOTAL * 5)).

**Audio detection (real mode):** `useAudioAnalysis` hook — Web Audio API, FFT 64, 32 bins. Attempt = volume >= 22 for >= 400ms continuously.

**Visual detection (webcam mode):** `useFaceLandmarks` hook — MediaPipe Face Landmarker, lip rounding score from landmarks 61, 291, 13, 14. Score >= 55 AND held for 2000ms = rep complete.

**CRITICAL RULE:** For targets with `visibility: "low"` (e.g. /s/, /k/), `feedbackMode` is `audio_only`. The webcam MUST NOT be used. Only audio interaction. No lip rounding score.

**Demo mode:** All webcam tracking is simulated via `useDemoMode`. Audio is simulated via `useAudioAnalysis(enabled, simulateAttempts=true)`.

### 6. Session Complete (`SessionCompletePage`)

**Structure (child-first):**

Top section (child-facing, always visible):
- Animated PlantIllustration (stage 4, size 130, `animate` prop)
- Headline: "Your plant grew! 🌱" (`text-3xl font-black`)
- Subtext: "Amazing practice, [targetLabel]!"
- Stars earned: 3 stars (⭐), staggered spring pop-in. Grayscale + 0.22 opacity for unearned.
- Attempt count card: large orange number + "great tries today!"
- **PRIMARY CTA: "Back to Adventure Map 🗺️"** (orange-500, rounded-full, large)

Bottom section (parent accordion, collapsed by default):
- Toggle: "👨‍👩‍👧 Grown-up summary ▼"
- Reveals:
  - Session meta (target, attempts detected, words practised)
  - Difficulty rating buttons (😊 Easy / 🙂 Okay / 😅 Hard)
  - Optional textarea for parent note
  - "Save parent note" button
  - "View full progress →" small link
  - Disclaimer text (tiny)

### 7. Parent Dashboard (`ParentDashboardPage`)
- Accessible via "👨‍👩‍👧 Grown-ups" on map or "View full progress" on session complete
- Stats grid: Sessions, Attempts, Completion %, Day streak
- `ProgressChart` (recharts line chart: completion rate + avg visual score over time)
- Target practice history list
- Recent parent note display
- Buttons: "📋 Clinician Summary" (blue-500) + "Start Practice 🌱" (orange-500)
- "Clear practice data" (destructive, small, slate-400)

### 8. Clinician Summary (`ClinicianSummaryPage`)
- Target selector if multiple targets practiced
- Target meta card (IPA, place, manner, voicing, feedback mode)
- Pre-formatted text report (copyable)
- "📋 Copy Summary" button
- Important disclaimer: clinical assessment warning

---

## Child-Facing vs Parent-Facing IA

### Child layer (visual, simple, playful, low-text)
- Adventure Map: emoji nodes, winding path, no clinical labels
- Practice: word bubble, mic button, water drops, growing plant
- Session complete: plant, stars, celebration
- Copy: "Say it", "Let's go!", "Your voice watered the sprout!", "Great try!", "Back to Adventure Map"

### Parent/clinician layer (calm, clinical, separate)
- All parent content in collapsible accordions
- Parent Dashboard: separate screen behind "Grown-ups" button
- Clinician Summary: text report with IPA, metrics, observation
- Session summary: hidden behind "Grown-up summary" toggle on session complete

---

## Five Map Modules

```typescript
const MAP_MODULES = [
  {
    id: "lip-pop-garden",
    title: "Lip Pop Garden",
    subtitle: "/p/ · /b/ · /m/",
    targetId: "p",
    words: ["pop", "puppy", "pea", "papa", "cup"],
    unlocked: true,
    emoji: "🌸",
    color: "#EA580C",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
  },
  {
    id: "round-lips-pond",
    title: "Round Lips Pond",
    subtitle: "/uː/ · OO sounds",
    targetId: "oo",
    words: ["moo", "boo", "moon", "pool", "food"],
    unlocked: true,
    emoji: "💧",
    color: "#7C3AED",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
  },
  {
    id: "tooth-breeze-trail",
    title: "Tooth Breeze Trail",
    subtitle: "/f/ · /v/ sounds",
    targetId: "f",
    words: ["fish", "fun", "leaf", "fox", "fly"],
    unlocked: false, comingSoon: true,
    emoji: "🍃",
    color: "#16A34A",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
  },
  {
    id: "snake-sound-meadow",
    title: "Snake Sound Meadow",
    subtitle: "/s/ · /z/ sounds",
    targetId: "s",
    words: ["sun", "sock", "snake", "star", "soup"],
    unlocked: false, comingSoon: true,
    emoji: "🐍",
    color: "#CA8A04",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
  },
  {
    id: "cave-sound-path",
    title: "Cave Sound Path",
    subtitle: "/k/ · /g/ sounds",
    targetId: "k",
    words: ["key", "cake", "car", "cup", "kite"],
    unlocked: false, comingSoon: true,
    emoji: "🦎",
    color: "#DC2626",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
  },
];
```

---

## Clinical Safety Rules — MUST ENFORCE

### Absolute prohibitions in child-facing UI:
- ❌ "correct" / "incorrect"
- ❌ "pass" / "fail"
- ❌ "diagnosis" / "disorder detected"
- ❌ "clinically verified" / "clinically accurate"
- ❌ "normal" / "abnormal"
- ❌ confidence percentages
- ❌ sound class estimates
- ❌ spectral centroid / high frequency energy values shown to children

### Required framing:
- ✅ "attempt detected"
- ✅ "visible movement"
- ✅ "practice behaviour"
- ✅ "consistency"
- ✅ "home practice"
- ✅ "support cue"
- ✅ "parent note"
- ✅ "clinician summary" (for parent/clinician view only)

### Webcam restriction:
- NEVER use webcam for `visibility: "low"` targets (/s/, /k/, /g/, /t/, /d/)
- These targets MUST use `feedbackMode: "audio_only"`
- No lip rounding score for audio-only targets
- The camera element must not appear at all for these targets

### Disclaimers (must appear):
- On landing: "complement work with a speech-language pathologist"
- On map footer: "SpeechSprout supports home practice only · Not a clinical assessment"
- On session complete: "Attempt detection tracks practice behaviour only · Not a clinical assessment"
- On clinician summary: "This summary describes home-practice behaviour only. It is not a clinical assessment and must not be used for diagnosis or treatment planning."
- On see-the-sound: "This guide shows placement only. It is not a clinical assessment."

---

## Audio Interaction Requirements

### Real mode (Web Audio API):
- Request microphone permission via `navigator.mediaDevices.getUserMedia({ audio: true })`
- AudioContext + AnalyserNode, FFT size 64 (32 frequency bins)
- Compute per-frame: volume (0–100), waveform (32 bins 0–100), spectral centroid, HF energy
- Attempt detection: raw volume >= 22 AND sustained for >= 400ms → `isAttemptDetected = true`
- On permission denied: show "🎤 Microphone needed" error state, no crash

### Demo mode (simulated):
- Use `setInterval` at 80ms ticks
- Sine wave oscillation for volume and waveform data
- Auto-trigger `isAttemptDetected = true` after 2400ms from activation
- No microphone request in demo mode

### Child-facing audio UI (VoiceWateringInteraction):
- 84px pulsing orange mic circle
- Two animated concentric rings (scale out, opacity fade, infinite loop while active)
- WaveformViz: 24 bars, each with unique idle breathing period
- On `isAttemptDetected`: water drop burst (5 drops, AnimatePresence, fly upward)
- Status: "Say 'word' out loud!" / "Your voice watered the sprout! 💧"
- Turn green on attempt detected

### Parent/clinician only metrics (NOT shown in child UI):
- Spectral centroid (0–100 normalized)
- High frequency energy percentage
- Attempt duration in ms
- Demo mode badge

---

## Webcam / MediaPipe Requirements

### Dependencies:
- `@mediapipe/tasks-vision@0.10.35` (dynamic import on first use)
- Model URL: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
- WASM URL: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm`

### Mouth landmarks used (478-point model):
- `13` = upper lip center
- `14` = lower lip center
- `61` = left mouth corner
- `291` = right mouth corner
- `33` = left eye outer (for IOD normalization)
- `263` = right eye outer
- `1` = nose tip (for symmetry)

### Metrics:
- `mouthWidth` = corner distance / inter-ocular distance
- `mouthOpening` = lip distance / IOD
- `roundnessRatio` = mouthOpening / mouthWidth
- `symmetryScore` = 1 - asymmetry * 3 (clamped 0–100)

### Lip rounding score (for /oo/ target):
- `roundnessScore` = (pursedWidth * 0.55 + ratioScore * 0.45) * 100
- `stabilityScore` = low variance in recent 8 values (100 - variance * 600)
- `total` = roundness * 0.45 + stability * 0.30 + symmetry * 0.25
- Threshold: `total >= 55` = `isAboveThreshold`
- Hold duration: must stay above threshold for `HOLD_DURATION_MS = 2000ms` to complete a rep

### Canvas overlay:
- Orange dots at mouth landmark indices: [61, 291, 13, 14, 78, 308, 82, 312, 87, 317, 95, 324]
- Orange outline tracing mouth perimeter

### Demo mode (visual):
- `useDemoMode` hook simulates mouthWidth/mouthOpening oscillation over time
- Score ramps up and down with sine waves
- No webcam request

---

## Data Persistence Requirements

- All data stored in localStorage (no backend, no auth)
- Keys: `ss_child_profile`, `ss_sessions`
- ChildProfile: persists across sessions
- Sessions: array, append-only during normal use
- "Clear practice data" button wipes sessions (not child profile)
- App reads child profile on init — if exists, skip landing and open map

---

## Acceptance Criteria

1. App loads and shows landing page (or map if returning user) within 2s
2. Full flow works: landing → setup → map → practice (5 attempts) → session complete → back to map
3. Adventure map shows circular nodes on winding path (NOT large cards)
4. Tapping a node opens a bottom sheet (NOT full page navigation)
5. Bottom sheet has "Let's go!" CTA and a collapsed "Grown-up details" accordion
6. Practice screen shows word bubble, plant, and VoiceWateringInteraction for audio targets
7. Webcam is NOT shown for /s/ or /k/ targets (audio_only)
8. Water drops animate upward on voice attempt detection
9. Plant grows across 5 stages (0–4) as attempts are completed
10. Session complete shows child celebration FIRST, parent check-in behind accordion
11. "Back to Adventure Map" is the primary CTA on session complete
12. All clinical language (correct/incorrect/pass/fail/diagnosed) is absent from child-facing screens
13. App works at max-width 430px on desktop (phone frame effect)
14. Demo mode works without camera or microphone
15. Sessions persist on page reload
16. Clinician summary is copyable text
