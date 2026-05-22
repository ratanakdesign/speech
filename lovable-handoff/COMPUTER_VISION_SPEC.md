# SpeechSprout — Computer Vision Specification

---

## Overview

SpeechSprout uses MediaPipe Face Landmarker to track lip position during practice for **high-visibility and partial-visibility targets only**. It is strictly prohibited from being used for targets where mouth interior is not visible through a camera.

---

## Which Targets Use Webcam

| Target | IPA | Visibility | Webcam Used | Why |
|--------|-----|-----------|-------------|-----|
| P | /p/ | high | ✅ Yes | Both lips clearly visible for closure |
| M | /m/ | high | ✅ Yes | Lip closure visible |
| OO | /uː/ | high | ✅ Yes | Lip rounding clearly visible |
| F | /f/ | partial | ✅ Yes (limited) | Lower lip position partially visible |
| S | /s/ | low | ❌ NEVER | Tongue tip position invisible |
| K | /k/ | low | ❌ NEVER | Back-of-tongue position invisible |

**Rule:** `if (target.feedbackMode === "audio_only") { // NEVER show webcam }`

The `feedbackMode: "audio_only"` flag is the authoritative gate. When this flag is set:
- No video element
- No canvas overlay
- No camera permission request
- No ScoreRing visible to child
- Only `VoiceWateringInteraction` component shown

---

## Which Targets MUST NOT Use Webcam

Alveolar targets (/s/, /z/, /t/, /d/) and velar targets (/k/, /g/):
- Sound production occurs inside the oral cavity
- Tongue position is not externally visible
- Attempting visual scoring for these targets would:
  - Give random/meaningless feedback
  - Create false impressions of clinical validity
  - Potentially mislead parents about production quality

**This is a clinical safety requirement, not a performance limitation.**

---

## MediaPipe Setup

### Package
```
@mediapipe/tasks-vision@0.10.35
```

### Loading (dynamic import — avoids initial bundle size)
```typescript
const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
const filesetResolver = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
);
const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
  baseOptions: {
    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    delegate: "GPU",
  },
  runningMode: "VIDEO",
  numFaces: 1,
});
```

### Camera
```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
});
```

### Processing loop
```typescript
// Called every animation frame
const result = landmarker.detectForVideo(video, performance.now());
if (result.faceLandmarks?.length > 0) {
  const lm = result.faceLandmarks[0]; // 478 landmarks
  drawLandmarks(lm);
  setMetrics(computeMouthMetrics(lm));
  setStatus("ready");
} else {
  setMetrics(EMPTY_METRICS);
  setStatus("no-face");
}
```

---

## Mouth Landmarks Used

From the 478-point MediaPipe Face Mesh model:

| Landmark Index | Location |
|---------------|----------|
| 13 | Upper lip center (medial) |
| 14 | Lower lip center (medial) |
| 61 | Left mouth corner |
| 291 | Right mouth corner |
| 33 | Left eye outer corner (for IOD) |
| 263 | Right eye outer corner (for IOD) |
| 1 | Nose tip (for symmetry baseline) |

**Additional landmarks drawn on canvas (visual feedback overlay):**
- Mouth region highlight: `[61, 291, 13, 14, 78, 308, 82, 312, 87, 317, 95, 324]`
- Mouth outline path: `[61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]`

---

## Metric Computation (`src/lib/geometry.ts`)

### Inter-Ocular Distance (IOD) — normalization baseline
```typescript
const iod = distance(leftEye, rightEye); // landmarks 33, 263
// Used to normalize all measurements for distance from camera
```

### Mouth Width
```typescript
mouthWidth = distance(leftCorner, rightCorner) / iod;
// Neutral ~0.55. Pursed for /oo/: < 0.40
```

### Mouth Opening
```typescript
mouthOpening = distance(upperLip, lowerLip) / iod;
// Neutral ~0.02-0.05. Open for /oo/: 0.06-0.18
```

### Roundness Ratio
```typescript
roundnessRatio = mouthOpening / Math.max(mouthWidth, 0.001);
// > 0.15 indicates rounding has begun
// Higher = more circular
```

### Symmetry Score
```typescript
const leftDist = distance(leftCorner, nose);
const rightDist = distance(rightCorner, nose);
const asymmetry = abs(leftDist - rightDist) / max(leftDist, rightDist);
symmetryScore = clamp((1 - asymmetry * 3) * 100, 0, 100);
// 100 = perfectly symmetric
```

---

## Lip Rounding Scoring (`src/lib/scoring.ts`)

Currently implemented for the /oo/ target (Round Lips Pond module). This is the only target with a continuous visual score.

### Roundness Score Component
```typescript
function scoreRoundness(roundnessRatio: number, mouthWidth: number): number {
  // pursedWidth: 1.0 when mouthWidth < 0.28, 0 when > 0.50
  const pursedWidth = clamp((0.50 - mouthWidth) / 0.22, 0, 1);
  
  // ratioScore: 1.0 when roundnessRatio > 0.57, 0 when < 0.12
  const ratioScore = clamp((roundnessRatio - 0.12) / 0.45, 0, 1);
  
  return (pursedWidth * 0.55 + ratioScore * 0.45) * 100;
}
```

### Stability Score Component
```typescript
// Measures variance in last 8 roundnessRatio readings
// High variance = unstable, score drops
const variance = stddev(recentValues) ** 2;
stabilityScore = clamp(100 - variance * 600, 0, 100);
// Typical useful range: 50-95
```

### Composite Score
```typescript
total = Math.round(
  roundnessScore * 0.45 +
  stabilityScore * 0.30 +
  symmetryScore  * 0.25
);
// Threshold: total >= 55 → isAboveThreshold = true
```

### Hold Duration
```typescript
// The child must sustain total >= 55 for 2000ms continuously
const HOLD_DURATION_MS = 2000;

// In the RAF loop:
if (result.isAboveThreshold) {
  if (holdStartRef.current === null) {
    holdStartRef.current = performance.now(); // start timer
  } else {
    const elapsed = performance.now() - holdStartRef.current;
    setHoldProgress(Math.min(100, (elapsed / HOLD_DURATION_MS) * 100));
    if (elapsed >= HOLD_DURATION_MS) {
      completeRep(result.total, elapsed, result.stabilityScore, result.symmetryScore);
    }
  }
} else {
  holdStartRef.current = null; // reset if they drop below threshold
  setHoldProgress(0);
}
```

### Feedback Messages (child/parent-facing)
- `mouthWidth > 0.48` → "Try making your lips into a smaller circle."
- `mouthOpening < 0.04` → "Open your lips a little while keeping the round shape."
- `stabilityScore < 45` → "Try holding the shape steady."
- `total >= 70` → "Great shape! Keep holding it. 🌱"
- `total >= 55` → "Looking good — hold that rounded shape!"
- default → "Round your lips into a small 'O' shape."

---

## Canvas Overlay

Drawn on a `<canvas>` element absolutely positioned over the `<video>`:

```typescript
// Orange dots at mouth region landmarks
ctx.fillStyle = "rgba(249,115,22,0.7)"; // orange-500
// Draw small circles (radius 3px) at each landmark

// Orange mouth outline
ctx.strokeStyle = "rgba(249,115,22,0.5)";
ctx.lineWidth = 1.5;
// Draw polyline along mouth outline path
```

**Important:** Canvas is mirrored (`scale-x-[-1]`) to match the mirrored video display. This gives the child a natural "looking in a mirror" experience.

---

## Visual Feedback Rules

### What is shown to the child:
- Their own face in the camera (mirrored)
- Orange landmark overlay on mouth region
- ScoreRing labeled "shape" (not "accuracy" or "score")
- ScoreRing labeled "hold" when score is above threshold
- Feedback text (e.g. "Round your lips into a small 'O' shape")

### What is NOT shown to the child:
- Raw metric numbers
- Spectral centroid values
- "Correct" or "Incorrect" labels
- Confidence percentages
- Any diagnostic language

### Parent/clinician only:
- `visualScore` (0-100) — in session summary and clinician report as "avg visual score"
- `holdDurationMs` — in clinician report as "average hold duration"
- `stabilityScore`, `symmetryScore` — stored in PracticeAttempt, accessible in future reports

---

## Fallback / Demo Behaviour

### Demo mode (`useDemoMode`):
```typescript
// Simulates mouth metrics with sine oscillation
const mouthWidth = lerp(0.48, 0.22, baseRoundedness * wave2);
const mouthOpening = lerp(0.02, 0.18, baseRoundedness * wave);
const simulatedScore = clamp(30 + baseRoundedness * 65 + (wave - 0.5) * 20, 0, 100);
```
- Score oscillates from ~30 to ~95 over time
- Eventually reaches threshold → rep completes automatically
- Shows animated 🤩 emoji instead of camera feed
- `"Simulated face tracking"` label

### Real mode errors:
- `permissionDenied`: "Camera unavailable · Use Demo Mode for a reliable pitch"
- `status === "loading"`: "Starting camera… 📷"
- `status === "no-face"`: "Move your face into the frame 👀" (amber overlay at bottom of video)
- `status === "error"`: Camera unavailable state

---

## Known Limitations

1. **Lighting dependency:** MediaPipe accuracy drops significantly in low light. No in-app compensation.

2. **Camera angle sensitivity:** Extreme angles (profile view) can cause detection failure or incorrect metrics.

3. **/p/ detection gap:** The current app uses the /oo/ lip rounding score for the lip-pop-garden module (targetId: "p"). However, /p/ production involves lip closure (mouthOpening ≈ 0), not lip rounding. The current visual score for /p/ uses the same `computeLipRoundingScore` function — which means it's measuring the wrong thing for /p/. For /p/, the ideal metric would be: `mouthOpening < 0.02` sustained for hold duration. **This is a known limitation/bug.**

4. **Latency:** MediaPipe loads from CDN (~2-3s on first use). The `status === "loading"` state handles this.

5. **GPU availability:** The model requests `delegate: "GPU"` — falls back to CPU on unsupported devices. No explicit fallback notification.

6. **Distance from camera:** IOD-normalization compensates for distance, but extreme distances reduce precision.

7. **Glasses, facial hair, or unusual facial proportions** may affect landmark accuracy.

---

## What the 3D Guide Shows vs What the Camera Detects

The `SeeTheSoundPage` 3D model shows anatomically-correct placement positions (or approximations) for educational purposes. However:

- The camera can only observe **external lip geometry**
- It cannot observe tongue position, velum position, or airflow
- The 3D guide for /s/ shows tongue-to-alveolar-ridge contact — but the camera cannot verify this
- The `isInvisibleToCamera: true` flag on a guide triggers a clear warning: "This guide shows placement only. It is not a clinical assessment."
