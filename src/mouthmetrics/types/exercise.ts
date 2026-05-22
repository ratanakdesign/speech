export type ExerciseType =
  | "lip_rounding"
  | "wide_smile"
  | "mouth_opening"
  | "lip_closure";

export interface ExerciseDefinition {
  type: ExerciseType;
  name: string;
  instruction: string;
  description: string;
  tracks: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  emoji: string;
}

export interface MouthMetrics {
  mouthWidth: number;
  mouthOpening: number;
  roundnessRatio: number;
  normalizedWidth: number;
  normalizedOpening: number;
  symmetryScore: number;
  faceRefDistance: number;
}

export interface ExerciseRep {
  id: string;
  repNumber: number;
  score: number;
  holdDurationMs: number;
  symmetryScore: number;
  stabilityScore: number;
  primaryMetric: number;
  completed: boolean;
  feedback: string[];
}

export interface ExerciseSession {
  id: string;
  exerciseType: ExerciseType;
  exerciseName: string;
  createdAt: string;
  reps: ExerciseRep[];
  averageScore: number;
  bestScore: number;
  averageSymmetry: number;
  averageStability: number;
  summary: string;
  isDemoData?: boolean;
}

export type AppPage =
  | "landing"
  | "exercise-select"
  | "practice"
  | "results"
  | "dashboard"
  | "therapist-summary";

export interface AppState {
  page: AppPage;
  selectedExercise: ExerciseDefinition | null;
  currentSession: ExerciseSession | null;
}
