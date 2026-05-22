# SpeechSprout — Component Map

Every significant component in the app, with purpose, props, state, dependencies, and flow connections.

---

## Pages

### `App` · `src/App.tsx`
**Purpose:** Root component. Manages page routing via `useState<AppPage>`. Mobile container wrapper.

**State:**
- `page: AppPage` — current active screen
- `isDemoMode: boolean`
- `selectedModule: MapModule | null`
- `selectedTarget: SpeechTarget | null`
- `currentSession: PracticeSession | null`

**Key logic:**
- Initial page: `loadChild() ? "map" : "landing"` (sync localStorage read)
- `handleSelectModule(m)` — looks up target by `m.targetId`, sets module+target state, navigates to "practice"
- Renders mobile container `max-w-[430px]` around all pages

**Dependencies:** All page components, useSessions, storage lib, speechTargets data

---

### `WelcomePage` · `src/pages/WelcomePage.tsx`
**Purpose:** Landing screen. Brand first impression.

**Props:** `{ onStart: () => void, onDemo: () => void }`

**State:** None

**Key features:**
- Stagger entrance animation (Framer Motion variants system)
- `const stagger = { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }`
- `const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, ... } }`

**Dependencies:** PlantIllustration, DisclaimerBanner, framer-motion

---

### `ChildSetupPage` · `src/pages/ChildSetupPage.tsx`
**Purpose:** One-time setup: nickname + age range.

**Props:** `{ onContinue: (profile: ChildProfile) => void, onBack: () => void }`

**State:** `nickname: string`, `ageRange: AgeRange | null`

**Key logic:**
- `canContinue = nickname.trim().length >= 1 && ageRange !== null`
- `handleSubmit()` creates `ChildProfile` with `crypto.randomUUID()` and `hasCompletedSetup: true`

**Age ranges:** `[{ value: "3-5", label: "3–5 years", emoji: "🐣" }, ...]`

**Dependencies:** framer-motion, types

---

### `LearningMapPage` · `src/pages/LearningMapPage.tsx`
**Purpose:** Adventure map hub. Module selection via bottom sheet.

**Props:** `{ child, sessions, onSelectModule, onParentView }`

**State:** `previewModule: MapModule | null`

**Key internal components:**
- `MapNode` — 88px circle node with state-based rendering
- `PathSegment` — SVG connector between nodes
- `ModuleSheet` — Bottom sheet with module details
- `ENV_ELEMENTS` — decorative emoji array with absolute positions

**Progress computation:**
```typescript
function computeModuleProgress(sessions): Record<string, ModuleProgress>
// Returns: { completed: bool, starsEarned: 0|1|2|3, sessionCount: number }
// Stars: rewardsEarned >= 5 → 3, >= 3 → 2, else → 1
```

**Current module logic:**
```typescript
function getCurrentModuleId(progress): string | null
// First unlocked, non-comingSoon, non-completed module
```

**SIDES array:** `["left", "right", "left", "right", "center"]` — determines node positioning

**Bottom sheet (ModuleSheet):**
- State: `showGrownUp: boolean`
- Gets `target` via `getTargetById(module.targetId)` for grown-up accordion
- "Let's go!" calls `onStart()` which calls `onSelectModule(module)`

**Dependencies:** MAP_MODULES data, speechTargets data, framer-motion

---

### `PracticePage` · `src/pages/PracticePage.tsx`
**Purpose:** Core practice game. 5 attempts per session.

**Props:** `{ child, module, target, isDemoMode, onComplete, onExit, onViewGuide }`

**State (main):**
- `phase: "intro" | "listening" | "rep-complete" | "done"`
- `attempts: PracticeAttempt[]`
- `attemptNum: number` (1–5)
- `plantStage: PlantStage` (0–4)
- `score: number` (visual score 0–100)
- `holdProgress: number` (0–100)
- `repFlash: boolean` (green ring trigger)
- `feedbackMsg: string`

**Refs (stable values for RAF/setTimeout):**
- `phaseRef, attemptNumRef, attemptsRef, repCompleteRef`
- `holdStartRef, recentRoundnessRef, rafRef, sessionStartRef, currentWordRef`

**Key computed values:**
- `currentWord = module.words[(attemptNum - 1) % module.words.length]`
- `completedCount = attempts.filter(a => a.completed).length`
- `isVisual = target.feedbackMode !== "audio_only"`

**Hooks used:**
- `useFaceLandmarks(useWebcam && phase === "listening")` — real webcam
- `useDemoMode(useDemoCV && phase === "listening")` — simulated webcam
- `useAudioAnalysis(!isVisual && phase === "listening", isDemoMode)` — audio

**RAF loop (visual targets):** Runs when `isVisual && phase === "listening"`. Calls `computeLipRoundingScore()`, manages hold timer, triggers `completeRep()`.

**Audio effect (audio targets):** Watches `audioState.isAttemptDetected`, calls `completeAudioRep()`.

**Rep completion flow:**
```
completeRep() or completeAudioRep()
  → create PracticeAttempt
  → append to attempts array
  → advance plant stage
  → setPhase("rep-complete")
  → setTimeout 1800ms → advanceAttempt()
    → if 5 complete → finishSession()
    → else → setPhase("listening"), increment attemptNum
```

**Session built in finishSession():**
```typescript
{
  id: crypto.randomUUID(),
  childId, moduleId, targetId, targetLabel, targetIpa,
  startedAt, completedAt: new Date().toISOString(),
  attempts: finalAttempts,
  wordsAttempted: finalAttempts.map(a => a.targetWord),
  rewardsEarned: completedAttempts.length,
  plantStage: 4,
}
```

**Dependencies:** PlantIllustration, WaterDrops, ScoreRing, VoiceWateringInteraction, FeedbackBubble, useFaceLandmarks, useAudioAnalysis, useDemoMode, scoring lib, framer-motion

---

### `SessionCompletePage` · `src/pages/SessionCompletePage.tsx`
**Purpose:** Post-session celebration for child. Parent check-in in accordion.

**Props:** `{ session, onUpdateSession, onViewDashboard, onPracticeAgain }`

**State:** `rating: DifficultyRating | null`, `note: string`, `saved: boolean`, `showGrownUp: boolean`

**Stars earned:**
```typescript
const starsEarned = completedCount >= 5 ? 3 : completedCount >= 3 ? 2 : completedCount >= 1 ? 1 : 0;
```

**Avg hold:** computed from attempts with `holdDurationMs` (visual targets only)

**Parent save:** `onUpdateSession({ ...session, parentDifficultyRating, parentNote })` — persists via App.tsx → storage

**Dependencies:** PlantIllustration, framer-motion

---

### `ParentDashboardPage` · `src/pages/ParentDashboardPage.tsx`
**Purpose:** Practice history overview for parents.

**Props:** `{ child, sessions, onClinicianSummary, onPractice, onBack, onClearData }`

**State:** All stats derived via `useMemo`

**Stats computed:**
- `totalSessions, totalAttempts, completedAttempts, completionRate`
- `streak`: consecutive days (includes today/yesterday as current)
- `targetCounts`: per-target session count and completion rate
- `lastSession, lastRating`

**Dependencies:** ProgressChart, PlantIllustration

---

### `ClinicianSummaryPage` · `src/pages/ClinicianSummaryPage.tsx`
**Purpose:** Generate copyable report for SLP.

**Props:** `{ child, sessions, onBack }`

**State:** `selectedTargetId: string`, `copied: boolean`

**Key logic:** `generateClinicianSummary(child, target, sessions)` from summaries lib

**Dependencies:** SPEECH_TARGETS, generateClinicianSummary, TargetBadge

---

### `SeeTheSoundPage` · `src/pages/SeeTheSoundPage.tsx`
**Purpose:** 3D articulation guide for visual/partial-visibility targets.

**Props:** `{ target, onStartPractice, onBack }`

**State:** `showParentDetails: boolean`

**Key logic:**
- Looks up `ARTICULATION_GUIDES[target.id]`
- Renders fallback if no guide (shouldn't happen for current targets)
- `isInvisibleToCamera` flag shows audio-only warning banner

**Dependencies:** MouthSceneCanvas, ARTICULATION_GUIDES, TargetBadge, Suspense

---

### `ModuleIntroPage` · `src/pages/ModuleIntroPage.tsx`
**Purpose:** (Legacy) Full-page module intro. **NOT in active routing.** Replaced by bottom sheet in LearningMapPage.

**Note:** File exists but is not imported by App.tsx. Kept for reference.

---

## Components

### `PlantIllustration` · `src/components/PlantIllustration.tsx`
**Purpose:** SVG plant at 5 growth stages.

**Props:** `{ stage: PlantStage (0-4), size?: number (default 120), animate?: boolean }`

**Stages:**
- 0: Seed (brown ellipse)
- 1: Sprout (tiny stem + 2 leaves)
- 2: Small plant (taller, 4 leaves)
- 3: Bud (stem + leaves + orange bud)
- 4: Full bloom (8 petals, yellow center, sparkles ✨⭐)

**Note:** The `animate` prop adds `transition-all duration-700` class for CSS transitions. The Framer Motion wrapper (`AnimatePresence` with key={plantStage}) in PracticePage handles the spring transition.

---

### `WaterDrops` · `src/components/WaterDrops.tsx`
**Purpose:** Progress indicator — filled/empty drop emojis.

**Props:** `{ total: number, filled: number }`

Renders `total` 💧 emojis. `i < filled` → full opacity + scale 1.1; else → opacity 0.25 + grayscale.

---

### `WaveformViz` · `src/components/WaveformViz.tsx`
**Purpose:** Animated audio waveform visualization.

**Props:** `{ waveformData: number[], volume: number, active: boolean, isAttemptDetected: boolean }`

**Key behavior:**
- 24 bars total
- Each bar has unique idle breathing: `idlePeak = idleBase + 4 + abs(sin(i * 0.43)) * 5`
- Idle animation period: `1.25 + (i % 7) * 0.14` seconds, offset by `delay: i * 0.068`
- Active: spring height from `waveformData[Math.floor(i/24 * 32)]`
- Color: `#CBD5E1` idle → `#F97316` active → `#22C55E` attempt detected

---

### `VoiceWateringInteraction` · `src/components/VoiceWateringInteraction.tsx`
**Purpose:** Child-facing audio interaction for audio-only targets.

**Props:** `{ audioState: AudioAnalysisState, currentWord: string, isDemoMode: boolean }`

**State:** `drops: Drop[]` — active water drop particles

**Drop interface:** `{ id: number, x: number, scale: number }`

**Burst logic:**
- Watches `isAttemptDetected` via `useEffect`
- On `false → true` edge: spawns 5 drops with random x offsets and scales
- Drops animate: y 0→-110, opacity 1→0, duration 1.1s
- Auto-removes after 1400ms

**Mic circle states:**
- `isAttemptDetected`: bg-green-400, bounce animation
- `isLoud` (volume > 25): bg-orange-400, scale pulse
- Default: bg-orange-500

**Ring animation:** Two `motion.div` with `animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}`, offset by 0.5s delay

**Permission denied state:** Shows amber error card instead of interaction

---

### `AudioAttemptPanel` · `src/components/AudioAttemptPanel.tsx`
**Purpose:** (Legacy) Technical audio panel. **Replaced by VoiceWateringInteraction** for child UI.

**Note:** May still be imported in older code paths. In the redesigned practice page, it is replaced by VoiceWateringInteraction.

---

### `ScoreRing` · `src/components/ScoreRing.tsx`
**Purpose:** Circular progress ring showing visual movement score or hold progress.

**Props:** `{ score: number, size: number, strokeWidth: number, label: string }`

**Labels in use:** `"shape"` (visual score) and `"hold"` (hold progress)

**Note:** Shown only in parent/practice supervisor context. Never shows "pronunciation score" or "accuracy."

---

### `FeedbackBubble` · `src/components/FeedbackBubble.tsx`
**Purpose:** Rep-complete feedback card with message.

**Props:** `{ message: string, variant: "success" | ... }`

Currently only `"success"` variant is used (green background).

---

### `DisclaimerBanner` · `src/components/DisclaimerBanner.tsx`
**Purpose:** Amber disclaimer banner shown on landing page.

**Props:** None

Contains SLP disclaimer text.

---

### `TargetBadge` · `src/components/TargetBadge.tsx`
**Purpose:** Pill badges showing feedback mode and visibility level.

**Props:** `{ feedbackMode: FeedbackMode, visibility: VisibilityLevel }`

Used in SeeTheSoundPage and ClinicianSummaryPage.

---

### `ProgressChart` · `src/components/ProgressChart.tsx`
**Purpose:** recharts line chart for session history.

**Props:** `{ sessions: PracticeSession[] }`

Two lines: orange (completion rate), blue (avg visual score).

---

### `MouthSceneCanvas` · `src/components/three/MouthScene.tsx`
**Purpose:** 3D interactive mouth model for articulation guide.

**Props:** `{ config: ArticulationSceneConfig, height?: number }`

**Internal components:**
- `MouthModel` — the full scene (lips, teeth, tongue, palate)
- `RoundMesh` — animated lip mesh (lerps position/scale via useFrame)
- `Tongue` — animated tongue body + tip
- `HighlightBump` — alveolar ridge and velum highlight spheres

**Config fields:**
```typescript
{
  lipsClosing: boolean,    // /p/, /m/ — lips close to centerline
  lipsRounding: boolean,   // /oo/ — lips narrow to small circle
  lowerLipRise: boolean,   // /f/ — lower lip lifts toward upper teeth
  tongueTipRaise: boolean, // /s/ — tongue tip toward alveolar ridge
  tongueBodyRaise: boolean,// /k/ — tongue body rises to velum
  highlightBilabial: boolean,
  highlightLabiodental: boolean,
  highlightAlveolar: boolean,
  highlightVelar: boolean,
}
```

**Camera:** position [0, 0.5, 4.2], fov 38

**Orbit controls:** No zoom, no pan, limited azimuth/polar angles

---

## Hooks

### `useAudioAnalysis` · `src/hooks/useAudioAnalysis.ts`
**Signature:** `(enabled: boolean, simulateAttempts?: boolean) => { audioState, resetAttempt }`

**State returned (AudioAnalysisState):**
```typescript
{
  volume: number,              // 0-100
  waveformData: number[],      // 32 bins, 0-100
  spectralCentroid: number,    // 0-100 normalized
  highFrequencyEnergy: number, // 0-100 percent
  isAttemptDetected: boolean,
  attemptDurationMs: number,
  active: boolean,
  permissionDenied: boolean,
}
```

**Real mode:** Web Audio API, FFT 64, raw volume >= 22 for >= 400ms → attempt detected

**Demo mode:** setInterval 80ms, sine wave simulation, auto-trigger at 2400ms

**Cleanup:** Cancels RAF, clears interval, closes AudioContext, stops MediaStream tracks

---

### `useFaceLandmarks` · `src/hooks/useFaceLandmarks.ts`
**Signature:** `(active: boolean) => { videoRef, canvasRef, metrics, status, permissionDenied }`

**Status:** `"idle" | "loading" | "ready" | "no-face" | "error"`

**Metrics (MouthMetrics):**
```typescript
{
  mouthWidth: number,     // corner distance / IOD
  mouthOpening: number,   // lip distance / IOD
  roundnessRatio: number, // opening / width
  symmetryScore: number,  // 0-100
  faceDetected: boolean,
}
```

**MediaPipe loading:** Dynamic import `@mediapipe/tasks-vision` on first activation. Loads model from CDN. `runningMode: "VIDEO"`, `numFaces: 1`.

**Canvas drawing:** Orange dots at mouth landmark indices, orange outline of mouth perimeter.

---

### `useDemoMode` · `src/hooks/useDemoMode.ts`
**Signature:** `(active: boolean) => { demoState, triggerDemoAttempt, resetAudio }`

**DemoState:**
```typescript
{
  metrics: MouthMetrics,      // simulated mouth metrics
  audioVolume: number,
  audioAttemptDetected: boolean,
  simulatedScore: number,     // 0-100 oscillating
}
```

**Simulation:** Oscillates mouthWidth (0.48→0.22) and mouthOpening (0.02→0.18) using sine waves. Score ramps 30→95 and back.

---

### `useSessions` · `src/hooks/useSessions.ts`
**Signature:** Returns `{ child, sessions, saveChildProfile, addSession, clearData }`

**Purpose:** Wraps localStorage read/write in React state. Single source of truth for child and sessions.

**Note:** `clearData` only clears sessions, not child profile.

---

## Utility Libraries

### `src/lib/geometry.ts`
- `computeMouthMetrics(landmarks)` → `MouthMetrics`
- `distance(a, b)` — Euclidean distance between two points

### `src/lib/scoring.ts`
- `computeLipRoundingScore(metrics, recentValues)` → `LipRoundingScore`
- `LIP_ROUNDING_THRESHOLD = 55`
- `HOLD_DURATION_MS = 2000`

### `src/lib/storage.ts`
- `saveChild(profile)`, `loadChild()` — localStorage read/write
- `saveSessions(sessions)`, `loadSessions()` — localStorage read/write
- `addSession(session)` — load, append, save
- `clearAll()` — removes both keys

### `src/lib/summaries.ts`
- `generateClinicianSummary(child, target, sessions)` → formatted string
- `generateParentSummary(child, sessions)` → short summary string

---

## Data Files

### `src/data/mapModules.ts`
- `MAP_MODULES: MapModule[]` — 5 modules
- `getModuleById(id)` — lookup
- `getModuleByTargetId(targetId)` — reverse lookup

### `src/data/speechTargets.ts`
- `SPEECH_TARGETS: SpeechTarget[]` — 6 targets (/p/, /m/, /oo/, /f/, /s/, /k/)
- `getTargetById(id)` — lookup

### `src/data/articulationGuides.ts`
- `ARTICULATION_GUIDES: Record<string, ArticulationGuide>` — 6 guides
- `ArticulationGuide` includes child instruction, parent cue, scene config, isInvisibleToCamera
