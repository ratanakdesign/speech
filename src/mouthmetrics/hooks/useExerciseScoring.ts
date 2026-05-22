import { useEffect, useRef, useState } from "react";
import {
  extractMouthMetrics,
  calculateExerciseScore,
  getExerciseFeedback,
  buildStabilityHistory,
  REPS_PER_SESSION,
  REP_THRESHOLD,
  HOLD_DURATION_MS,
  type NormalizedLandmark,
} from "../lib/scoring";
import { generateSessionSummary } from "../lib/summaries";
import { mean } from "../lib/geometry";
import type { ExerciseType, ExerciseRep, ExerciseSession, ExerciseDefinition } from "../types/exercise";

interface ExerciseScoringState {
  score: number;
  feedback: string;
  holdProgressMs: number;
  repCount: number;
  completedReps: ExerciseRep[];
  isHolding: boolean;
  sessionComplete: boolean;
  metrics: {
    symmetryScore: number;
    stabilityScore: number;
    primaryMetric: number;
  };
}

interface UseExerciseScoringReturn extends ExerciseScoringState {
  buildSession: (exercise: ExerciseDefinition, isDemoData?: boolean) => ExerciseSession;
}

export function useExerciseScoring(
  landmarks: NormalizedLandmark[] | null,
  exerciseType: ExerciseType,
  faceDetected: boolean
): UseExerciseScoringReturn {
  const [state, setState] = useState<ExerciseScoringState>({
    score: 0,
    feedback: "Position your face in the camera frame",
    holdProgressMs: 0,
    repCount: 0,
    completedReps: [],
    isHolding: false,
    sessionComplete: false,
    metrics: { symmetryScore: 0, stabilityScore: 0, primaryMetric: 0 },
  });

  const holdStartRef = useRef<number | null>(null);
  const stabilityHistoryRef = useRef<number[]>([]);
  const lastRepFeedbackRef = useRef<string[]>([]);
  const completedRepsRef = useRef<ExerciseRep[]>([]);
  const sessionCompleteRef = useRef(false);

  useEffect(() => {
    if (sessionCompleteRef.current) return;

    if (!landmarks || !faceDetected) {
      holdStartRef.current = null;
      setState((prev) => ({
        ...prev,
        score: 0,
        isHolding: false,
        holdProgressMs: 0,
        feedback: faceDetected
          ? "Tracking..."
          : "Move your face into the camera frame",
      }));
      return;
    }

    const mouthMetrics = extractMouthMetrics(landmarks);
    const { score, primaryMetric, stabilityScore } = calculateExerciseScore(
      mouthMetrics,
      exerciseType,
      stabilityHistoryRef.current
    );

    stabilityHistoryRef.current = buildStabilityHistory(
      stabilityHistoryRef.current,
      primaryMetric
    );

    const feedback = getExerciseFeedback(mouthMetrics, exerciseType, score, faceDetected);
    lastRepFeedbackRef.current = [feedback];

    const now = Date.now();
    let holdProgressMs = 0;
    let isHolding = false;

    if (score >= REP_THRESHOLD) {
      if (!holdStartRef.current) {
        holdStartRef.current = now;
      }
      holdProgressMs = now - holdStartRef.current;
      isHolding = true;

      if (holdProgressMs >= HOLD_DURATION_MS) {
        // Complete the rep
        const newRep: ExerciseRep = {
          id: crypto.randomUUID(),
          repNumber: completedRepsRef.current.length + 1,
          score: Math.round(score),
          holdDurationMs: holdProgressMs,
          symmetryScore: Math.round(mouthMetrics.symmetryScore),
          stabilityScore: Math.round(stabilityScore),
          primaryMetric,
          completed: true,
          feedback: lastRepFeedbackRef.current,
        };

        const newReps = [...completedRepsRef.current, newRep];
        completedRepsRef.current = newReps;

        holdStartRef.current = null;
        stabilityHistoryRef.current = [];
        const repComplete = newReps.length >= REPS_PER_SESSION;
        if (repComplete) sessionCompleteRef.current = true;

        setState((prev) => ({
          ...prev,
          score: Math.round(score),
          feedback: repComplete ? "Session complete!" : "Rep complete! Get ready for the next one.",
          holdProgressMs: 0,
          repCount: newReps.length,
          completedReps: newReps,
          isHolding: false,
          sessionComplete: repComplete,
          metrics: {
            symmetryScore: Math.round(mouthMetrics.symmetryScore),
            stabilityScore: Math.round(stabilityScore),
            primaryMetric,
          },
        }));
        return;
      }
    } else {
      holdStartRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      score: Math.round(score),
      feedback,
      holdProgressMs,
      isHolding,
      metrics: {
        symmetryScore: Math.round(mouthMetrics.symmetryScore),
        stabilityScore: Math.round(stabilityScore),
        primaryMetric,
      },
    }));
  }, [landmarks, exerciseType, faceDetected]);

  const buildSession = (exercise: ExerciseDefinition, isDemoData = false): ExerciseSession => {
    const reps = completedRepsRef.current;
    const scores = reps.map((r) => r.score);
    const avgScore = scores.length > 0 ? Math.round(mean(scores)) : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      id: crypto.randomUUID(),
      exerciseType: exercise.type,
      exerciseName: exercise.name,
      createdAt: new Date().toISOString(),
      reps,
      averageScore: avgScore,
      bestScore,
      averageSymmetry: Math.round(mean(reps.map((r) => r.symmetryScore))),
      averageStability: Math.round(mean(reps.map((r) => r.stabilityScore))),
      summary: generateSessionSummary(reps, exercise.type),
      isDemoData,
    };
  };

  return { ...state, buildSession };
}
