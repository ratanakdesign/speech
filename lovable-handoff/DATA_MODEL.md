# SpeechSprout — Data Model

All TypeScript types, data structures, localStorage schema, and example seed data.

---

## Core Types (`src/types/index.ts`)

```typescript
export type AgeRange = "3-5" | "6-8" | "9-12";

export type FeedbackMode =
  | "audio_only"           // voice detection only, no webcam
  | "audio_plus_visual"    // webcam mouth tracking + voice
  | "visual_movement_only";// webcam only (not used in current modules)

export type VisibilityLevel =
  | "high"     // lips visible (bilabial: /p/, /m/, /oo/)
  | "partial"  // partially visible (labiodental: /f/)
  | "low";     // not visible through camera (alveolar /s/, velar /k/)

export type TherapyStage =
  | "establishment"  // learning to produce the sound correctly
  | "word_level";    // practising in single words

export type PlantStage = 0 | 1 | 2 | 3 | 4;
// 0 = seed, 1 = sprout, 2 = small plant, 3 = bud, 4 = full bloom

export type DifficultyRating = "easy" | "okay" | "hard";

export type AppPage =
  | "landing"
  | "child-setup"
  | "map"
  | "module-intro"    // legacy — replaced by bottom sheet in map
  | "see-the-sound"
  | "practice"
  | "session-complete"
  | "parent-dashboard"
  | "clinician-summary";
```

---

## ChildProfile

```typescript
export interface ChildProfile {
  id: string;              // crypto.randomUUID()
  nickname: string;        // 1-20 chars, chosen by parent
  ageRange: AgeRange;      // "3-5" | "6-8" | "9-12"
  createdAt: string;       // ISO 8601 string
  hasCompletedSetup?: boolean; // true after first setup completion
}
```

**Example:**
```json
{
  "id": "c7f2e1a0-3b4d-4f5a-8c2d-1e9f0b3a7e1c",
  "nickname": "Ava",
  "ageRange": "3-5",
  "createdAt": "2025-01-15T09:30:00.000Z",
  "hasCompletedSetup": true
}
```

---

## SpeechTarget

```typescript
export interface SpeechTarget {
  id: string;              // "p" | "m" | "oo" | "f" | "s" | "k"
  label: string;           // "P" | "M" | "OO" | "F" | "S" | "K"
  ipa: string;             // "/p/" | "/m/" | "/uː/" | "/f/" | "/s/" | "/k/"
  place: string;           // "bilabial" | "labiodental" | "alveolar" | "velar"
  manner: string;          // "stop" | "nasal" | "approximant" | "fricative"
  voicing: "voiced" | "voiceless";
  visibility: VisibilityLevel;
  feedbackMode: FeedbackMode;
  therapyStage: TherapyStage;
  exampleWords: string[];  // 5 practice words
  visualCue?: string;      // Child-facing mouth shape instruction
  parentCue?: string;      // Parent observation guidance
  color: string;           // Tailwind color name: "orange" | "blue" | "purple" | "green" | "yellow" | "red"
  emoji: string;           // Representative emoji
  placementGuideType?: string; // e.g. "bilabial-stop", "lip-rounding"
}
```

**All 6 targets:**

| id | label | ipa | place | manner | voicing | visibility | feedbackMode |
|----|-------|-----|-------|--------|---------|-----------|--------------|
| p | P | /p/ | bilabial | stop | voiceless | high | audio_plus_visual |
| m | M | /m/ | bilabial | nasal | voiced | high | audio_plus_visual |
| oo | OO | /uː/ | bilabial | approximant | voiced | high | audio_plus_visual |
| f | F | /f/ | labiodental | fricative | voiceless | partial | audio_plus_visual |
| s | S | /s/ | alveolar | fricative | voiceless | low | audio_only |
| k | K | /k/ | velar | stop | voiceless | low | audio_only |

---

## MapModule

```typescript
export interface MapModule {
  id: string;          // e.g. "lip-pop-garden"
  title: string;       // e.g. "Lip Pop Garden"
  subtitle: string;    // e.g. "/p/ · /b/ · /m/"
  targetId: string;    // links to SpeechTarget.id
  words: string[];     // exactly 5 practice words
  unlocked: boolean;   // true = playable
  emoji: string;       // map node emoji
  color: string;       // hex color for theming (e.g. "#EA580C")
  bgColor: string;     // Tailwind bg class (e.g. "bg-orange-100")
  borderColor: string; // Tailwind border class (e.g. "border-orange-300")
  comingSoon?: boolean;// if true, shows lock + "Coming Soon"
}
```

**All 5 modules:**

```typescript
const MAP_MODULES: MapModule[] = [
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
    unlocked: false,
    comingSoon: true,
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
    unlocked: false,
    comingSoon: true,
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
    unlocked: false,
    comingSoon: true,
    emoji: "🦎",
    color: "#DC2626",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
  },
];
```

---

## PracticeAttempt

One voice/visual attempt within a session.

```typescript
export interface PracticeAttempt {
  id: string;                    // crypto.randomUUID()
  attemptNumber: number;         // 1-5
  targetLabel: string;           // e.g. "P"
  targetWord: string;            // e.g. "pop" (specific word said this attempt)
  audioAttemptDetected: boolean; // always true for completed attempts
  visualScore?: number;          // 0-100, only for audio_plus_visual targets
  holdDurationMs?: number;       // ms, only for visual targets with hold detection
  stabilityScore?: number;       // 0-100, from computeLipRoundingScore
  symmetryScore?: number;        // 0-100, from face landmarks
  completed: boolean;            // true if attempt threshold was met
  feedback: string;              // child-facing feedback string
}
```

**Example (audio attempt):**
```json
{
  "id": "a1b2c3d4-...",
  "attemptNumber": 1,
  "targetLabel": "S",
  "targetWord": "sun",
  "audioAttemptDetected": true,
  "completed": true,
  "feedback": "Great try! 🌟"
}
```

**Example (visual attempt):**
```json
{
  "id": "e5f6g7h8-...",
  "attemptNumber": 2,
  "targetLabel": "OO",
  "targetWord": "moo",
  "audioAttemptDetected": true,
  "visualScore": 72,
  "holdDurationMs": 2150,
  "stabilityScore": 84,
  "symmetryScore": 91,
  "completed": true,
  "feedback": "Nice hold! You watered your plant! 💧"
}
```

---

## PracticeSession

One complete practice session (5 attempts).

```typescript
export interface PracticeSession {
  id: string;                          // crypto.randomUUID()
  childId: string;                     // links to ChildProfile.id
  moduleId: string;                    // e.g. "lip-pop-garden"
  targetId: string;                    // e.g. "p"
  targetLabel: string;                 // e.g. "P"
  targetIpa: string;                   // e.g. "/p/"
  startedAt: string;                   // ISO 8601
  completedAt?: string;                // ISO 8601
  attempts: PracticeAttempt[];         // array, typically 5
  wordsAttempted: string[];            // ["pop", "puppy", "pea", "papa", "cup"]
  rewardsEarned: number;               // count of completed attempts (0-5)
  plantStage: PlantStage;              // always 4 (full bloom) at session end
  parentDifficultyRating?: DifficultyRating; // "easy" | "okay" | "hard"
  parentNote?: string;                 // optional free-text from parent
}
```

**Example:**
```json
{
  "id": "s9t0u1v2-...",
  "childId": "c7f2e1a0-...",
  "moduleId": "lip-pop-garden",
  "targetId": "p",
  "targetLabel": "P",
  "targetIpa": "/p/",
  "startedAt": "2025-01-20T14:30:00.000Z",
  "completedAt": "2025-01-20T14:35:22.000Z",
  "attempts": [...5 attempts...],
  "wordsAttempted": ["pop", "puppy", "pea", "papa", "cup"],
  "rewardsEarned": 4,
  "plantStage": 4,
  "parentDifficultyRating": "okay",
  "parentNote": "Was distracted at first but settled after word 2"
}
```

---

## AudioAnalysisState

Returned by `useAudioAnalysis` hook.

```typescript
export interface AudioAnalysisState {
  volume: number;              // 0-100 (raw * 2, capped)
  waveformData: number[];      // 32 bins, each 0-100
  spectralCentroid: number;    // 0-100 normalized spectral center of mass
  highFrequencyEnergy: number; // 0-100 % energy in top 1/3 of FFT bins
  isAttemptDetected: boolean;  // true when volume >= 22 for >= 400ms
  attemptDurationMs: number;   // ms since threshold exceeded
  active: boolean;             // true when mic is streaming
  permissionDenied: boolean;   // true if getUserMedia rejected
}
```

**NOTE:** `spectralCentroid` and `highFrequencyEnergy` are computed but should only appear in clinician-facing summaries, never in child-facing UI.

---

## MouthMetrics

Returned by `computeMouthMetrics()` from face landmarks.

```typescript
export interface MouthMetrics {
  mouthWidth: number;     // corner distance / inter-ocular distance (normalized)
  mouthOpening: number;   // lip gap / inter-ocular distance (normalized)
  roundnessRatio: number; // mouthOpening / mouthWidth (>0 = more round)
  symmetryScore: number;  // 0-100 (100 = perfectly symmetric)
  faceDetected: boolean;
}
```

**Typical neutral values:**
- mouthWidth: ~0.55
- mouthOpening: ~0.02-0.05
- roundnessRatio: ~0.05-0.1

**Target values for /oo/ (lip rounding):**
- mouthWidth: < 0.40
- mouthOpening: 0.06-0.18
- roundnessRatio: > 0.15

---

## LipRoundingScore

```typescript
export interface LipRoundingScore {
  total: number;           // 0-100 composite score
  roundnessScore: number;  // 0-100 from pursed width + ratio
  stabilityScore: number;  // 0-100 (variance of recent 8 values)
  symmetryScore: number;   // 0-100 from face landmarks
  isAboveThreshold: boolean; // total >= 55
  feedback: string;        // child/parent-facing feedback message
}
```

---

## ModuleProgress (internal to LearningMapPage)

```typescript
interface ModuleProgress {
  completed: boolean;
  starsEarned: 0 | 1 | 2 | 3;
  // Stars: rewardsEarned >= 5 → 3, >= 3 → 2, >= 1 → 1
  sessionCount: number;
}
```

---

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `ss_child_profile` | JSON `ChildProfile` | Single child profile |
| `ss_sessions` | JSON `PracticeSession[]` | All sessions, append-only |

**Note:** Both keys are scoped to the domain. There is no user authentication. Multiple children on the same device would share the same profile (intended limitation for v0.1).

---

## ArticulationGuide

Used by SeeTheSoundPage and MouthSceneCanvas.

```typescript
export interface ArticulationGuide {
  targetId: string;
  childInstruction: string;   // Playful, child-facing placement instruction
  mechanicsExplainer: string; // Brief anatomical explanation (italic)
  parentCue: string;          // What parents should observe
  isInvisibleToCamera: boolean; // true for /s/ and /k/
  cameraNote?: string;        // Audio-only warning text
  emoji: string;
  scene: ArticulationSceneConfig; // Config for 3D model
}

export interface ArticulationSceneConfig {
  lipsClosing: boolean;        // /p/, /m/ — lips approach midline
  lipsRounding: boolean;       // /oo/ — lips narrow to circle
  lowerLipRise: boolean;       // /f/ — lower lip lifts toward teeth
  tongueTipRaise: boolean;     // /s/ — tongue tip toward alveolar ridge
  tongueBodyRaise: boolean;    // /k/ — tongue body contacts velum
  highlightBilabial: boolean;  // highlight lips
  highlightLabiodental: boolean; // highlight lower lip + upper teeth
  highlightAlveolar: boolean;  // highlight alveolar ridge bump
  highlightVelar: boolean;     // highlight velum bump
}
```

---

## Example Seed Data for Testing

```json
{
  "ss_child_profile": {
    "id": "demo-child-001",
    "nickname": "Sunny",
    "ageRange": "6-8",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "hasCompletedSetup": true
  },
  "ss_sessions": [
    {
      "id": "demo-session-001",
      "childId": "demo-child-001",
      "moduleId": "lip-pop-garden",
      "targetId": "p",
      "targetLabel": "P",
      "targetIpa": "/p/",
      "startedAt": "2025-01-15T09:00:00.000Z",
      "completedAt": "2025-01-15T09:05:00.000Z",
      "attempts": [
        {
          "id": "att-001", "attemptNumber": 1, "targetLabel": "P",
          "targetWord": "pop", "audioAttemptDetected": true,
          "visualScore": 68, "holdDurationMs": 2100, "stabilityScore": 80,
          "symmetryScore": 88, "completed": true, "feedback": "Great try! 🌟"
        },
        {
          "id": "att-002", "attemptNumber": 2, "targetLabel": "P",
          "targetWord": "puppy", "audioAttemptDetected": true,
          "visualScore": 74, "holdDurationMs": 2350, "stabilityScore": 85,
          "symmetryScore": 91, "completed": true, "feedback": "Nice one! 💧"
        },
        {
          "id": "att-003", "attemptNumber": 3, "targetLabel": "P",
          "targetWord": "pea", "audioAttemptDetected": true,
          "visualScore": 61, "holdDurationMs": 2010, "stabilityScore": 72,
          "symmetryScore": 86, "completed": true, "feedback": "You did it! 🌱"
        },
        {
          "id": "att-004", "attemptNumber": 4, "targetLabel": "P",
          "targetWord": "papa", "audioAttemptDetected": true,
          "visualScore": 79, "holdDurationMs": 2450, "stabilityScore": 90,
          "symmetryScore": 93, "completed": true, "feedback": "Brilliant! ⭐"
        },
        {
          "id": "att-005", "attemptNumber": 5, "targetLabel": "P",
          "targetWord": "cup", "audioAttemptDetected": true,
          "visualScore": 55, "holdDurationMs": 2050, "stabilityScore": 68,
          "symmetryScore": 82, "completed": true, "feedback": "Amazing! 🌸"
        }
      ],
      "wordsAttempted": ["pop", "puppy", "pea", "papa", "cup"],
      "rewardsEarned": 5,
      "plantStage": 4,
      "parentDifficultyRating": "okay",
      "parentNote": "Got all 5 — took a few seconds to warm up"
    }
  ]
}
```
