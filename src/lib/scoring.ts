import type { MouthMetrics } from "./geometry";

export interface LipRoundingScore {
  total: number;
  roundnessScore: number;
  stabilityScore: number;
  symmetryScore: number;
  isAboveThreshold: boolean;
  feedback: string;
}

// Typical neutral mouthWidth/IOD ~ 0.55. For OO we want < 0.40.
// mouthOpening/IOD neutral ~ 0.02-0.05. For OO we want 0.06-0.18.
function scoreRoundness(roundnessRatio: number, mouthWidth: number): number {
  const pursedWidth = Math.max(0, Math.min(1, (0.50 - mouthWidth) / 0.22));
  const ratioScore = Math.max(0, Math.min(1, (roundnessRatio - 0.12) / 0.45));
  return (pursedWidth * 0.55 + ratioScore * 0.45) * 100;
}

export function computeLipRoundingScore(
  metrics: MouthMetrics,
  recentRoundnessValues: number[]
): LipRoundingScore {
  if (!metrics.faceDetected) {
    return {
      total: 0,
      roundnessScore: 0,
      stabilityScore: 0,
      symmetryScore: 0,
      isAboveThreshold: false,
      feedback: "Move your face into the camera frame.",
    };
  }

  const roundnessScore = scoreRoundness(metrics.roundnessRatio, metrics.mouthWidth);

  // Stability: low variance in recent roundness values
  let stabilityScore = 80;
  if (recentRoundnessValues.length >= 4) {
    const mean = recentRoundnessValues.reduce((a, b) => a + b, 0) / recentRoundnessValues.length;
    const variance = recentRoundnessValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentRoundnessValues.length;
    stabilityScore = Math.max(0, Math.min(100, 100 - variance * 600));
  }

  const symmetryScore = metrics.symmetryScore;

  const total = Math.round(
    roundnessScore * 0.45 +
    stabilityScore * 0.30 +
    symmetryScore * 0.25
  );

  const clamped = Math.max(0, Math.min(100, total));
  const isAboveThreshold = clamped >= 55;

  let feedback = "";
  if (metrics.mouthWidth > 0.48) {
    feedback = "Try making your lips into a smaller circle.";
  } else if (metrics.mouthOpening < 0.04) {
    feedback = "Open your lips a little while keeping the round shape.";
  } else if (stabilityScore < 45) {
    feedback = "Try holding the shape steady.";
  } else if (clamped >= 70) {
    feedback = "Great shape! Keep holding it. 🌱";
  } else if (clamped >= 55) {
    feedback = "Looking good — hold that rounded shape!";
  } else {
    feedback = "Round your lips into a small 'O' shape.";
  }

  return { total: clamped, roundnessScore, stabilityScore, symmetryScore, isAboveThreshold, feedback };
}

export const LIP_ROUNDING_THRESHOLD = 55;
export const HOLD_DURATION_MS = 2000;
