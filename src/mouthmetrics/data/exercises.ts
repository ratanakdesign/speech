import type { ExerciseDefinition } from "../types/exercise";

export const EXERCISES: ExerciseDefinition[] = [
  {
    type: "lip_rounding",
    name: "Lip Rounding",
    instruction: 'Make an "OO" shape and hold it',
    description: 'Practise making and holding a rounded lip posture as in the "OO" sound.',
    tracks: ["Roundness ratio", "Hold stability", "Symmetry"],
    difficulty: "Beginner",
    emoji: "👄",
  },
  {
    type: "wide_smile",
    name: "Wide Smile",
    instruction: 'Make an "EE" smile shape and hold it',
    description: 'Stretch your lips wide into a smile position as in the "EE" sound.',
    tracks: ["Mouth width", "Lip spread", "Symmetry"],
    difficulty: "Beginner",
    emoji: "😁",
  },
  {
    type: "mouth_opening",
    name: "Mouth Opening",
    instruction: 'Open your mouth like "AH" and hold it',
    description: 'Open your mouth vertically and hold the open position.',
    tracks: ["Vertical opening", "Hold duration", "Stability"],
    difficulty: "Beginner",
    emoji: "😮",
  },
  {
    type: "lip_closure",
    name: "Lip Closure",
    instruction: 'Press lips together like P/B/M then hold',
    description: 'Bring your lips together and hold a firm closed position.',
    tracks: ["Closure distance", "Hold duration", "Stability"],
    difficulty: "Intermediate",
    emoji: "🤐",
  },
];
