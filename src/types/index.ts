export type AgeRange = "3-5" | "6-8" | "9-12";
export type FeedbackMode = "audio_only" | "audio_plus_visual" | "visual_movement_only";
export type VisibilityLevel = "high" | "partial" | "low";
export type TherapyStage = "establishment" | "word_level";
export type PlantStage = 0 | 1 | 2 | 3 | 4;
export type DifficultyRating = "easy" | "okay" | "hard";
export type AppPage =
  | "landing"
  | "child-setup"
  | "target-select"
  | "practice"
  | "session-complete"
  | "parent-dashboard"
  | "clinician-summary";

export interface ChildProfile {
  id: string;
  nickname: string;
  ageRange: AgeRange;
  createdAt: string;
}

export interface SpeechTarget {
  id: string;
  label: string;
  ipa: string;
  place: string;
  manner: string;
  voicing: "voiced" | "voiceless";
  visibility: VisibilityLevel;
  feedbackMode: FeedbackMode;
  therapyStage: TherapyStage;
  exampleWords: string[];
  visualCue?: string;
  parentCue?: string;
  color: string;
  emoji: string;
}

export interface PracticeAttempt {
  id: string;
  attemptNumber: number;
  targetLabel: string;
  audioAttemptDetected: boolean;
  visualScore?: number;
  holdDurationMs?: number;
  stabilityScore?: number;
  symmetryScore?: number;
  completed: boolean;
  feedback: string;
}

export interface PracticeSession {
  id: string;
  childId: string;
  targetId: string;
  targetLabel: string;
  targetIpa: string;
  startedAt: string;
  completedAt?: string;
  attempts: PracticeAttempt[];
  rewardsEarned: number;
  plantStage: PlantStage;
  parentDifficultyRating?: DifficultyRating;
  parentNote?: string;
}
