import { clamp, distance, normalise, stabilityFromHistory } from "./geometry";
import type { ExerciseType, MouthMetrics } from "../types/exercise";

// MediaPipe Face Mesh / FaceLandmarker landmark indices
export const LM = {
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  LEFT_CORNER: 61,
  RIGHT_CORNER: 291,
  UPPER_LIP_CENTER_INNER: 13,
  LOWER_LIP_CENTER_INNER: 14,
  UPPER_LIP_CENTER_OUTER: 0,
  LOWER_LIP_CENTER_OUTER: 17,
  NOSE_TIP: 1,
  LEFT_UPPER_LIP: 37,
  RIGHT_UPPER_LIP: 267,
  LEFT_LOWER_LIP: 84,
  RIGHT_LOWER_LIP: 314,
  // Outer lip path for drawing
  OUTER_LIP: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61],
  INNER_LIP: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78],
} as const;

export const REP_THRESHOLD = 58;
export const HOLD_DURATION_MS = 2000;
export const REPS_PER_SESSION = 3;

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export function extractMouthMetrics(landmarks: NormalizedLandmark[]): MouthMetrics {
  const lm = (idx: number) => landmarks[idx];

  const faceRefDistance = distance(lm(LM.LEFT_EYE_OUTER), lm(LM.RIGHT_EYE_OUTER));
  if (faceRefDistance === 0) {
    return {
      mouthWidth: 0,
      mouthOpening: 0,
      roundnessRatio: 0,
      normalizedWidth: 0,
      normalizedOpening: 0,
      symmetryScore: 0,
      faceRefDistance: 0,
    };
  }

  const mouthWidth = distance(lm(LM.LEFT_CORNER), lm(LM.RIGHT_CORNER));
  const mouthOpening = distance(lm(LM.UPPER_LIP_CENTER_INNER), lm(LM.LOWER_LIP_CENTER_INNER));

  const normalizedWidth = mouthWidth / faceRefDistance;
  const normalizedOpening = mouthOpening / faceRefDistance;
  const roundnessRatio = mouthWidth > 0 ? mouthOpening / mouthWidth : 0;

  // Symmetry: compare left and right corner distances to nose tip
  const noseCenter = lm(LM.NOSE_TIP);
  const leftDist = distance(lm(LM.LEFT_CORNER), noseCenter);
  const rightDist = distance(lm(LM.RIGHT_CORNER), noseCenter);
  const diffRatio =
    leftDist + rightDist > 0
      ? Math.abs(leftDist - rightDist) / ((leftDist + rightDist) / 2)
      : 0;
  const symmetryScore = clamp((1 - diffRatio * 4) * 100, 0, 100);

  return {
    mouthWidth,
    mouthOpening,
    roundnessRatio,
    normalizedWidth,
    normalizedOpening,
    symmetryScore,
    faceRefDistance,
  };
}

export function calculateExerciseScore(
  metrics: MouthMetrics,
  exerciseType: ExerciseType,
  stabilityHistory: number[]
): { score: number; primaryMetric: number; stabilityScore: number } {
  const stability = stabilityFromHistory(stabilityHistory);

  let primaryScore = 0;
  let primaryMetric = 0;

  switch (exerciseType) {
    case "lip_rounding": {
      // OO shape: higher roundnessRatio + narrower width
      const roundnessScore = normalise(metrics.roundnessRatio, 0.10, 0.55) * 100;
      // Narrowness bonus: neutral width ~0.45, OO width ~0.20-0.30
      const narrownessScore = normalise(0.48 - metrics.normalizedWidth, 0, 0.25) * 100;
      primaryScore = clamp(roundnessScore * 0.6 + narrownessScore * 0.4, 0, 100);
      primaryMetric = metrics.roundnessRatio;

      const composite =
        primaryScore * 0.45 + stability * 0.30 + metrics.symmetryScore * 0.25;
      return { score: clamp(composite, 0, 100), primaryMetric, stabilityScore: stability };
    }

    case "wide_smile": {
      // EE shape: wide mouth, symmetrical
      const widthScore = normalise(metrics.normalizedWidth, 0.38, 0.68) * 100;
      primaryScore = clamp(widthScore, 0, 100);
      primaryMetric = metrics.normalizedWidth;

      const composite =
        primaryScore * 0.45 + metrics.symmetryScore * 0.35 + stability * 0.20;
      return { score: clamp(composite, 0, 100), primaryMetric, stabilityScore: stability };
    }

    case "mouth_opening": {
      // AH shape: vertical opening
      const openingScore = normalise(metrics.normalizedOpening, 0.04, 0.22) * 100;
      primaryScore = clamp(openingScore, 0, 100);
      primaryMetric = metrics.normalizedOpening;

      const composite = primaryScore * 0.70 + stability * 0.30;
      return { score: clamp(composite, 0, 100), primaryMetric, stabilityScore: stability };
    }

    case "lip_closure": {
      // P/B/M: lips together
      const closureScore = normalise(0.06 - metrics.normalizedOpening, 0, 0.06) * 100;
      primaryScore = clamp(closureScore, 0, 100);
      primaryMetric = metrics.normalizedOpening;

      const composite = primaryScore * 0.70 + stability * 0.30;
      return { score: clamp(composite, 0, 100), primaryMetric, stabilityScore: stability };
    }
  }
}

export function getExerciseFeedback(
  metrics: MouthMetrics,
  exerciseType: ExerciseType,
  score: number,
  faceDetected: boolean
): string {
  if (!faceDetected) return "Move your face into the camera frame";

  switch (exerciseType) {
    case "lip_rounding": {
      if (score >= 80) return "Excellent rounded shape — hold it!";
      if (score >= 60) return "Good rounding — keep it steady";
      if (metrics.roundnessRatio < 0.18) return "Open slightly while rounding your lips";
      if (metrics.normalizedWidth > 0.45) return "Try rounding your lips more";
      return "Make an OO shape and hold it";
    }

    case "wide_smile": {
      if (score >= 80) return "Great smile — hold that shape!";
      if (score >= 60) return "Nice width — keep it steady";
      if (metrics.symmetryScore < 60) return "Try to keep both sides even";
      if (metrics.normalizedWidth < 0.42) return "Try stretching your lips wider";
      return "Stretch into a wide EE smile";
    }

    case "mouth_opening": {
      if (score >= 80) return "Great opening — hold that position!";
      if (score >= 60) return "Good opening — keep it steady";
      if (metrics.normalizedOpening < 0.05) return "Open your mouth wider";
      return "Open wide like an AH sound";
    }

    case "lip_closure": {
      if (score >= 80) return "Good closure — hold it!";
      if (score >= 60) return "Almost there — press lips gently together";
      if (metrics.normalizedOpening > 0.04) return "Press your lips together";
      return "Close your lips like a P or B sound";
    }
  }
}

export function buildStabilityHistory(
  history: number[],
  newValue: number,
  maxLength = 30
): number[] {
  const next = [...history, newValue];
  if (next.length > maxLength) next.shift();
  return next;
}
