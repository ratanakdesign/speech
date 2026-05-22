import { useEffect, useRef, useState } from "react";
import type { ExerciseRep, ExerciseSession, ExerciseType, ExerciseDefinition } from "../types/exercise";
import { generateSessionSummary } from "../lib/summaries";
import { mean } from "../lib/geometry";
import { REPS_PER_SESSION } from "../lib/scoring";

interface DemoModeState {
  score: number;
  feedback: string;
  holdProgressMs: number;
  repCount: number;
  completedReps: ExerciseRep[];
  sessionComplete: boolean;
  metrics: { symmetryScore: number; stabilityScore: number; primaryMetric: number };
}

const DEMO_SCORE_SEQUENCE = [
  30, 38, 45, 52, 58, 64, 70, 74, 78, 82, 78, 80, 82, 80, 84, 82, 80, 78, 82,
];

const DEMO_FEEDBACK: Record<ExerciseType, string[]> = {
  lip_rounding: ["Round your lips more", "Getting there...", "Hold that shape!", "Excellent rounded shape — hold it!"],
  wide_smile: ["Try stretching wider", "Good width!", "Hold the smile steady", "Great smile — hold that shape!"],
  mouth_opening: ["Open a little wider", "Good opening!", "Hold that position", "Great opening — hold that position!"],
  lip_closure: ["Press lips together", "Nearly there...", "Hold closure", "Good closure — hold it!"],
};

export function useDemoMode(enabled: boolean, exerciseType: ExerciseType) {
  const [state, setState] = useState<DemoModeState>({
    score: 0,
    feedback: "Demo Mode — face tracking simulated",
    holdProgressMs: 0,
    repCount: 0,
    completedReps: [],
    sessionComplete: false,
    metrics: { symmetryScore: 75, stabilityScore: 72, primaryMetric: 0.4 },
  });

  const frameRef = useRef(0);
  const repRef = useRef(0);
  const holdStartRef = useRef<number | null>(null);
  const completedRepsRef = useRef<ExerciseRep[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCompleteRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    sessionCompleteRef.current = false;
    frameRef.current = 0;
    repRef.current = 0;
    holdStartRef.current = null;
    completedRepsRef.current = [];

    intervalRef.current = setInterval(() => {
      if (sessionCompleteRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const idx = frameRef.current % DEMO_SCORE_SEQUENCE.length;
      const score = DEMO_SCORE_SEQUENCE[idx];
      const feedbackList = DEMO_FEEDBACK[exerciseType];
      let feedback = feedbackList[Math.min(Math.floor(idx / 5), feedbackList.length - 1)];

      let holdProgressMs = 0;
      const now = Date.now();

      if (score >= 58) {
        if (!holdStartRef.current) holdStartRef.current = now;
        holdProgressMs = now - holdStartRef.current;

        if (holdProgressMs >= 2000) {
          const rep: ExerciseRep = {
            id: crypto.randomUUID(),
            repNumber: completedRepsRef.current.length + 1,
            score: Math.round(score),
            holdDurationMs: holdProgressMs,
            symmetryScore: 72 + Math.round(Math.random() * 15),
            stabilityScore: 68 + Math.round(Math.random() * 18),
            primaryMetric: 0.42 + Math.random() * 0.15,
            completed: true,
            feedback: [feedback],
          };

          completedRepsRef.current = [...completedRepsRef.current, rep];
          holdStartRef.current = null;
          holdProgressMs = 0;
          frameRef.current = 0;
          repRef.current += 1;

          const isComplete = completedRepsRef.current.length >= REPS_PER_SESSION;
          if (isComplete) sessionCompleteRef.current = true;

          feedback = isComplete ? "Session complete!" : "Rep complete! Ready for the next one.";

          setState({
            score: Math.round(score),
            feedback,
            holdProgressMs: 0,
            repCount: completedRepsRef.current.length,
            completedReps: completedRepsRef.current,
            sessionComplete: isComplete,
            metrics: {
              symmetryScore: rep.symmetryScore,
              stabilityScore: rep.stabilityScore,
              primaryMetric: rep.primaryMetric,
            },
          });

          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
      } else {
        holdStartRef.current = null;
      }

      frameRef.current += 1;

      setState((prev) => ({
        ...prev,
        score: Math.round(score),
        feedback,
        holdProgressMs,
        repCount: completedRepsRef.current.length,
        completedReps: completedRepsRef.current,
      }));
    }, 150);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, exerciseType]);

  const buildDemoSession = (exercise: ExerciseDefinition): ExerciseSession => {
    const reps = completedRepsRef.current;
    const scores = reps.map((r) => r.score);

    return {
      id: crypto.randomUUID(),
      exerciseType: exercise.type,
      exerciseName: exercise.name,
      createdAt: new Date().toISOString(),
      reps,
      averageScore: scores.length ? Math.round(mean(scores)) : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      averageSymmetry: Math.round(mean(reps.map((r) => r.symmetryScore))),
      averageStability: Math.round(mean(reps.map((r) => r.stabilityScore))),
      summary: generateSessionSummary(reps, exercise.type),
      isDemoData: true,
    };
  };

  return { ...state, buildDemoSession };
}
