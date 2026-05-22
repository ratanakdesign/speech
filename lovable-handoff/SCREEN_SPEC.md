# SpeechSprout — Screen-by-Screen Specification

---

## Screen 1: Landing Page (`WelcomePage`)

**Purpose:** First impression and onboarding entry point. Sets tone: playful, safe, clinician-complementary.

**Primary user:** Parent or child (together)

**Layout:**
```
[PlantIllustration stage=4 size=84px]
"SpeechSprout" (Speech=orange, Sprout=green, text-5xl font-black)
"Practise. Grow. Shine! 🌟" (text-lg font-bold text-slate-600)

[White card, rounded-3xl, shadow-xl]
  "Playful speech practice activities designed to complement
   work with a speech-language pathologist."
  [3-column grid]
    🎤 "Say it"    💧 "Water it"    🌸 "Grow it"

[Start Practice 🌱] (orange-500, rounded-full, py-4 font-black text-lg)
[View Demo] (white with border)

[DisclaimerBanner]
"Activity targets are selected by a parent or clinician.
 SpeechSprout does not prescribe therapy."
```

**Components:** PlantIllustration, DisclaimerBanner

**State:** None (stateless)

**Microinteractions:**
- All sections stagger in with Framer Motion (staggerChildren 0.1, delayChildren 0.05)
- Each section uses fadeUp variant (opacity 0→1, y 16→0, duration 0.32)
- PlantIllustration pops in with spring (scale 0.7→1, stiffness 260, damping 18)
- Both buttons: `whileTap={{ scale: 0.96 }}` spring

**Copy (exact):**
- "Playful speech practice activities designed to complement work with a speech-language pathologist."
- "Practise. Grow. Shine! 🌟"
- "Start Practice 🌱"
- "View Demo"

**Data used:** None

**What happens next:**
- "Start Practice" → if child exists in localStorage → Adventure Map; else → Child Setup
- "View Demo" → same routing but sets `isDemoMode = true`

---

## Screen 2: Child Setup (`ChildSetupPage`)

**Purpose:** Capture child nickname and age range. Personalizes the experience. One-time setup.

**Primary user:** Parent (filling in for child)

**Layout:**
```
👋 (text-4xl)
"Let's get started!" (text-3xl font-black)
"Tell us a little about the child practising today." (text-sm font-semibold text-slate-500)

[White card, rounded-3xl]
  Nickname *
  [text input, large, rounded-2xl, font-black]
  
  Age range *
  [🐣 3–5 years] [🌱 6–8 years] [🌻 9–12 years]
  (3 equal-width buttons)

[Continue →] (orange when filled, slate when disabled, rounded-full, py-4)
[← Back] (small, slate-400)
```

**Components:** None external

**State:**
- `nickname: string` (min 1 char, max 20)
- `ageRange: AgeRange | null`
- `canContinue = nickname.trim().length >= 1 && ageRange !== null`

**Microinteractions:**
- Whole form animates in: opacity 0→1, y 20→0, duration 0.32
- Age range buttons: selected one springs to scale 1.06; tap scales to 0.93
- Continue button: disabled state at scale 0.98; enabled springs to scale 1
- Pressing Enter in nickname field triggers submit if can continue

**Copy (exact):**
- Placeholder: "e.g. Ava, Leo, Sunny…"
- Age labels: "3–5 years", "6–8 years", "9–12 years"

**Data used:** Nothing read (first-time setup)

**Data written:** `ChildProfile` to localStorage on submit

**What happens next:** Adventure Map

---

## Screen 3: Adventure Map (`LearningMapPage`)

**Purpose:** The main game hub. Shows all 5 modules as nodes on a winding adventure path. Allows module selection.

**Primary user:** Child

**Layout:**
```
[Header: 56px]
  "Hi [nickname]! 🌱" (text-2xl font-black)
  [⭐ X stars earned] pill (amber-100, text-xs)
  [👨‍👩‍👧 Grown-ups] button (top right, white rounded-full)

[Scrollable map area: flex flex-col, min-height 760px]
  [Decorative env elements: ☁️🌻🐸🍄☁️🌿⭐ at fixed positions]
  
  Node 0 (left, 10% margin) ← 🌸 Lip Pop Garden (unlocked)
  [Path connector: left→right curve]
  Node 1 (right, 10% margin) ← 💧 Round Lips Pond (unlocked)
  [Path connector: right→left curve]
  Node 2 (left) ← 🍃 Tooth Breeze Trail (locked)
  [Path connector]
  Node 3 (right) ← 🐍 Snake Sound Meadow (locked)
  [Path connector]
  Node 4 (center) ← 🦎 Cave Sound Path (locked)
  
  [Footer disclaimer text]
```

**Each node (unlocked):**
- 88px circle, `rounded-full`, colored background
- Module emoji (text-4xl)
- Current module: two expanding ring animations (pulsing glow)
- Completed: absolute green ✓ badge (top-right, 24px circle)
- Below: module name (10px, font-black), 3 stars (⭐⭐⭐)

**Each node (locked):**
- Same size, grayscale, 50% opacity
- 🔒 below emoji, "Coming Soon" text

**Path connectors:**
- SVG, full width, h-14
- Dashed yellow curved lines
- viewBox "0 0 100 52", preserveAspectRatio="none"
- Left→right: `M 22 0 C 22 28, 78 28, 78 52`
- Right→left: `M 78 0 C 78 28, 22 28, 22 52`

**Microinteractions:**
- Nodes stagger in: delay = index * 0.08, spring stiffness 320 damping 24
- Unlocked nodes: `whileTap={{ scale: 0.88 }}`
- Bottom sheet: AnimatePresence slide-up spring (stiffness 380, damping 38)
- Backdrop: opacity 0→1 on open

**States:**
- `previewModule: MapModule | null` (controls bottom sheet)
- Module progress: computed from sessions (completed bool, starsEarned 0-3)

**Bottom sheet contents:**
```
[Handle bar]
[Module tile: emoji + name + subtitle]
[Word chips: pop, puppy, pea, papa, cup]
[Let's go! 🌸] (orange-500, rounded-full, large, whileTap 0.96)
[👨‍👩‍👧 Grown-up details ▼] accordion trigger
  (expanded: sound target, feedback mode, mouth tip, disclaimer)
```

**Data used:** sessions array (for progress computation), child profile (for greeting)

**What happens next:**
- "Let's go!" → Practice Game
- "Grown-ups" button → Parent Dashboard

---

## Screen 4: See the Sound (`SeeTheSoundPage`)

**Purpose:** Interactive 3D mouth guide showing articulation placement for the current target sound. Educational, for child + parent.

**Primary user:** Child with parent supervision

**Layout:**
```
[Top bar]
  ← Back    [Target badge]    Skip →

[Target header: emoji + "S /s/"]

[3D Canvas: MouthSceneCanvas, height 270px, draggable]
"Drag to rotate · Highlighted parts show where the sound is made"

[Audio-only warning] (if isInvisibleToCamera)
  ⚠️ "Audio practice only"
  "This sound relies on tongue placement inside the mouth..."

[White card: "For the child 👶"]
  "Point your tongue tip toward the bumpy ridge..."
  [mechanic explainer in italic]

[TargetBadge: feedback mode + visibility]

[👨‍👩‍👧 Parent/Carer cue accordion]
  Parent observation tip

[Anatomy key badges: alveolar ridge / soft palate / lips]

[Got it — Start Practice! 🌱] (orange-500, large)

"This guide shows placement only. It is not a clinical assessment."
```

**Components:** MouthSceneCanvas, TargetBadge

**State:** `showParentDetails: boolean` (parent accordion)

**Microinteractions:**
- 3D model idles with gentle y-rotation (sin wave)
- Lips/tongue animate to target positions (lerp at 3.5 speed)
- Highlighted regions pulse (emissive intensity oscillates)

**Data used:** `target: SpeechTarget`, `ARTICULATION_GUIDES[target.id]`

**What happens next:** "Start Practice" or "Skip" → Practice Game; "Back" → Practice (restarts fresh)

---

## Screen 5: Practice Game (`PracticePage`)

**Purpose:** The core game loop. Child says 5 words, voice is detected, plant grows.

**Primary user:** Child

**Layout (top to bottom):**
```
[Top bar, narrow]
  ← Exit    "Lip Pop Garden" + DEMO badge    👁 Guide

[Word bubble — HERO]
  White rounded-[2.5rem] card
  "pop" (text-5xl font-black text-slate-800)
  "say it out loud! 🎤" (if audio target + listening)
  OR target.visualCue (if visual target + listening)

[Plant + WaterDrops card]
  White rounded-3xl
  PlantIllustration (stage 0-4, 80px) — spring entrance on stage change
  WaterDrops: 5 💧 icons, filled = completedCount, empty = grayscale

[Voice interaction]
  Audio targets: VoiceWateringInteraction component
  Visual targets: ScoreRing + feedback text + camera (16:9 compact)

[Rep-complete feedback]
  Green card: "Great try! 🌟" (AnimatePresence, spring pop-in)

[Start button — intro phase only]
  "Let's go! 🎤" (orange-500, full width, rounded-full)
```

**Practice phases:**
- `intro`: word shown, start button visible
- `listening`: audio/visual scoring active
- `rep-complete`: feedback shows, auto-advances after 1800ms
- `done`: session complete triggered

**VoiceWateringInteraction (audio targets):**
```
[Pulsing mic circle, 84px, orange]
  Two ring animations while active (expand outward, opacity→0)
  Turns green + bounces on isAttemptDetected

[WaveformViz, 24 bars]
  Idle: staggered breathing (unique period per bar)
  Active: spring height response to volume

[5 water drops on attempt]
  AnimatePresence burst upward (y: 0→-110, opacity fade)

[Status text]
  "Get ready…" / "Say 'pop' out loud!" / "Your voice watered the sprout! 💧"
```

**Visual tracking (visual targets only):**
```
[ScoreRing "shape" + ScoreRing "hold" (if holding)]
[Feedback text from computeLipRoundingScore]
[Camera view: 16:9 ratio, compact]
  OR animated emoji (demo mode)
```

**Plant growth logic:**
- `plantStage = floor(completedCount / TOTAL_ATTEMPTS * 5)` capped at 4
- AnimatePresence key={plantStage}: scale 0.6→1, spring stiffness 260

**Word cycling:**
- `currentWord = module.words[(attemptNum - 1) % module.words.length]`
- AnimatePresence key={currentWord}: spring entrance (scale 0.8→1, y 12→0)

**Session data built:**
- 5 PracticeAttempts
- PracticeSession with moduleId, wordsAttempted array, rewardsEarned count

**Microinteractions:**
- Plant card flashes green ring on rep complete (`ring-4 ring-green-400`)
- Word bubble springs in on each new word
- Start button AnimatePresence fade-in/out
- Feedback bubble spring pop-in (stiffness 420 damping 24)

**Data used:** module, target, child, sessions (for practice history), isDemoMode

**What happens next:** After 5 attempts → Session Complete

---

## Screen 6: Session Complete (`SessionCompletePage`)

**Purpose:** Celebrate the child's practice. Provide parent a discreet check-in. Return to map.

**Primary user:** Child first, then parent

**Layout:**
```
[Child celebration — always visible]
  PlantIllustration (stage 4, 130px, animate prop)
  "Your plant grew! 🌱" (text-3xl font-black)
  "Amazing practice, [targetLabel]!" (text-slate-500)
  
  [3 stars: ⭐⭐⭐]
    Staggered spring pop-in (staggerChildren 0.09, delayChildren 0.3)
    Unearned: grayscale, opacity 0.22
  
  [Attempt count card, white rounded-3xl]
    "5" (text-4xl font-black text-orange-500)
    "great tries today!" (text-sm text-slate-500)
    avg hold duration if visual target
  
  [Back to Adventure Map 🗺️] (orange-500, rounded-full, PRIMARY CTA, py-5)

[Grown-up section — collapsed by default]
  [👨‍👩‍👧 Grown-up summary ▼] toggle button
  
  [AnimatePresence expandable section]
    [Session meta card: target, attempts, words practised]
    
    [Difficulty: 😊 Easy | 🙂 Okay | 😅 Hard] (3 buttons)
    
    [Optional note textarea]
    
    [Save parent note] → shows "✓ Saved!" on save
    
    [View full progress →] (small link → Parent Dashboard)
    
    [Disclaimer text, tiny, slate-300]
```

**State:**
- `showGrownUp: boolean` (accordion)
- `rating: DifficultyRating | null`
- `note: string`
- `saved: boolean`

**Microinteractions:**
- Plant springs in: stiffness 240, damping 16, delay 0.1
- Headline fades up: delay 0.28
- Stars stagger in: delay 0.3, each pops with spring
- Attempt card fades up: delay 0.48
- Primary CTA slides in: delay 0.55
- Grown-up accordion: height 0→auto, opacity 0→1, duration 0.26

**Stars earned logic:**
- 5 completed → 3 stars
- 3–4 completed → 2 stars
- 1–2 completed → 1 star

**Data used:** PracticeSession (attempts, wordsAttempted, targetLabel, targetIpa)

**What happens next:** "Back to Adventure Map" → Adventure Map

---

## Screen 7: Parent Dashboard (`ParentDashboardPage`)

**Purpose:** Overview of child's practice history. Calm, informational, clinical metadata for parents.

**Primary user:** Parent

**Layout:**
```
← Back    "[nickname]'s Progress"

[Stats grid: 2×2]
  📅 Sessions    🎤 Attempts
  ✅ Completion %    🔥 Day streak

[Progress chart: recharts LineChart]
  X axis: session index
  Y axis: 0-100
  Orange line: completion rate per session
  Blue line: avg visual score (if present)

[Target practice history]
  For each practiced target:
    "P /p/ · 3 sessions" [80%] badge

[Recent parent note]
  Italic quoted note text
  Difficulty rating badge

[📋 Clinician Summary] (blue-500)
[Start Practice 🌱] (orange-500)
[Clear practice data] (tiny, destructive)
```

**State:** All derived via `useMemo` from `sessions` array

**Streak logic:** Counts consecutive days with at least one session (includes today and yesterday as "current")

**Empty state:** Full-screen placeholder with PlantIllustration stage 0 + "No practice yet" message

**What happens next:** Clinician Summary or back to map

---

## Screen 8: Clinician Summary (`ClinicianSummaryPage`)

**Purpose:** Generate a copyable practice behaviour report for the child's SLP.

**Primary user:** Parent (to copy and send to clinician)

**Layout:**
```
← Back
"Clinician Summary" (text-3xl)
"A copyable practice behaviour report for your speech pathologist."

[Target selector — if multiple targets practiced]
  Pill buttons for each practiced target

[Target meta card]
  IPA icon + label
  Place/manner/voicing
  TargetBadge (feedback mode + visibility)
  Audio-only note if applicable

[Practice Report card]
  Header: "Practice Report" + [Copy] button
  Pre-formatted text block (pre tag, font-sans)
  
[Important disclaimer banner (blue-50)]
  "This summary describes home-practice behaviour only..."

[📋 Copy Summary] button
```

**Report content (copyable text):**
```
SpeechSprout Practice Summary
──────────────────────────────
Child: Ava (age 3-5)
Target: P /p/
Classification: bilabial stop, voiceless
Feedback mode: Audio + visual movement support
Therapy stage: Establishment

Practice period: 01/01/2025 – 05/01/2025
Sessions completed: 3
Total attempts: 15
Completion rate: 87%
Words practised: pop, puppy, pea, papa, cup
Average hold duration: 2.3 seconds

Observation: Ava completed most attempts and demonstrated
consistent effort throughout the sessions.
Most recent session difficulty: easy

Suggested discussion: Consider whether Ava is ready to practise
/p/ in short words or phrases.

──────────────────────────────
This summary describes home-practice behaviour only...
```

**State:** `selectedTargetId`, `copied`

**Data used:** Child profile, all sessions, speech targets

**What happens next:** Back to Parent Dashboard

---

## Shared Components

### DisclaimerBanner
- Amber-50 background, border-amber-200
- "⚠️ Home practice support only" header
- Disclaimer paragraph
- Used on: Landing Page

### TargetBadge
- Pill badges for feedback mode (color-coded)
- Pill badge for visibility level
- Used on: See the Sound, Clinician Summary

### PlantIllustration
- SVG plant at stages 0–4 (seed → sprout → small → bud → bloom)
- `animate` prop adds CSS transition classes
- Stage 4 has sparkles (✨⭐)
- Used on: Landing, Practice, Session Complete, Parent Dashboard (empty state)

### WaterDrops
- Row of 5 💧 emojis
- Filled: full opacity, scale 1.1; Empty: opacity 0.25, grayscale
- Used on: Practice

### WaveformViz
- 24 bars, Framer Motion
- Idle: unique breathing cycle per bar (staggered phase/period)
- Active: spring height from waveform data
- Colors: slate-200 (idle) → orange (active) → green (attempt detected)
- Used on: VoiceWateringInteraction

### VoiceWateringInteraction
- Pulsing mic circle (84px, orange→green)
- Two ring animations while active
- WaveformViz
- Water drop burst on attempt (5 drops, AnimatePresence)
- Status text
- Used on: Practice (audio targets only)

### ScoreRing
- SVG ring with fill progress
- Labels: "shape" (for visual score), "hold" (for hold progress)
- NOT shown in child-facing UI label
- Used on: Practice (visual targets only)

### FeedbackBubble
- Rounded card for rep-complete messages
- Variants: success (green)
- Used on: Practice (being phased out in favor of inline card)

### ProgressChart
- recharts `LineChart` with two lines
- Responsive container
- Used on: Parent Dashboard

### MouthSceneCanvas
- @react-three/fiber Canvas
- Contains MouthModel (lips, teeth, tongue, palate)
- OrbitControls (no zoom, limited rotation)
- Lip/tongue meshes animate to target position based on `ArticulationSceneConfig`
- Used on: See the Sound

---

## Navigation Map

```
landing ──────────────────→ child-setup → map
                                          ↑ (returning user)
map ──→ (bottom sheet) → practice → session-complete → map
         ↓ grown-ups                        ↓ view progress
      parent-dashboard ──────────────────────↗
          ↓
      clinician-summary

practice → see-the-sound → practice (restarts)
```
