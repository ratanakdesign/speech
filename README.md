# MouthMetrics

A browser-based computer vision prototype that helps users practise speech therapy-related mouth and facial movements at home.

MouthMetrics uses your **webcam** and **MediaPipe Face Landmarker** to track visible mouth movement in real time during therapist-prescribed practice exercises. It does not diagnose speech disorders or replace a speech pathologist.

---

## Features

- Real-time webcam-based facial landmark tracking via MediaPipe
- 4 exercises: Lip Rounding, Wide Smile, Mouth Opening, Lip Closure
- Live score (0–100) updated from actual landmark geometry
- Rep completion: hold target movement for 2 seconds at score ≥ 58
- Mouth landmark overlay drawn on webcam feed
- Session history stored in localStorage
- Progress chart (Recharts)
- Therapist-ready copyable summary
- Demo Mode fallback if camera/model fails to load

---

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 3
- [@mediapipe/tasks-vision](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) — FaceLandmarker (WASM + model loaded from CDN)
- Recharts
- localStorage (no backend)

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- A modern browser with WebGL support (Chrome/Edge recommended for MediaPipe GPU delegate)
- A webcam

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/ratanakdesign/speech.git
cd speech

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** MediaPipe Face Landmarker loads its WASM runtime and model file (~8 MB) from CDN on first use. Allow a few seconds on the first visit. Internet access is required for the tracking to initialise.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server (hot reload) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Project Structure

```
src/
  main.jsx                      Entry point
  index.css                     CSS entry (imports globals)
  styles/
    globals.css                 Tailwind directives + base reset
  mouthmetrics/
    MouthMetricsApp.tsx         Top-level state router
    types/exercise.ts           Shared TypeScript types
    data/exercises.ts           Exercise definitions
    lib/
      geometry.ts               Distance / clamp / stdDev utilities
      scoring.ts                Landmark indices + exercise scoring logic
      summaries.ts              Session + therapist summary generators
      storage.ts                localStorage helpers
    hooks/
      useFaceLandmarks.ts       MediaPipe model loader + rAF inference loop
      useExerciseScoring.ts     Rep scoring, hold timer, rep completion
      useLocalStorageSessions.ts Session persistence
      useDemoMode.ts            Simulated session fallback
    components/                 11 reusable UI components
    pages/                      6 screen-level page components
```

---

## MediaPipe Notes

- Package: `@mediapipe/tasks-vision` v0.10.35
- WASM loaded from: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm`
- Model loaded from: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
- Key mouth landmark indices: `13` (upper inner), `14` (lower inner), `61` (left corner), `291` (right corner), `33`/`263` (eye reference for normalisation)

---

## Disclaimer

MouthMetrics tracks **visible mouth movement behaviour** during therapist-prescribed practice exercises. It does **not** diagnose speech disorders, assess speech accuracy, or replace a speech pathologist.
