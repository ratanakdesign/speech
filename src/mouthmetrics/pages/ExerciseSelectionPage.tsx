import React from "react";
import { EXERCISES } from "../data/exercises";
import { ExerciseCard } from "../components/ExerciseCard";
import type { ExerciseDefinition, ExerciseSession } from "../types/exercise";

interface Props {
  onSelect: (exercise: ExerciseDefinition) => void;
  onBack: () => void;
  sessions: ExerciseSession[];
}

export function ExerciseSelectionPage({ onSelect, onBack, sessions }: Props) {
  const statsFor = (type: string) => {
    const s = sessions.filter((sess) => sess.exerciseType === type);
    return {
      sessionCount: s.length,
      bestScore: s.length ? Math.max(...s.map((ss) => ss.bestScore)) : undefined,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 transition-colors text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="font-bold text-slate-900">Choose an Exercise</h1>
          <p className="text-xs text-slate-400">Select a therapist-prescribed practice movement</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXERCISES.map((exercise) => {
            const stats = statsFor(exercise.type);
            return (
              <ExerciseCard
                key={exercise.type}
                exercise={exercise}
                onSelect={onSelect}
                bestScore={stats.bestScore}
                sessionCount={stats.sessionCount > 0 ? stats.sessionCount : undefined}
              />
            );
          })}
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
          <p className="font-medium mb-1">💡 About these exercises</p>
          <p>
            These are common oral-motor practice movements. Always follow your
            therapist's instructions — MouthMetrics tracks visible movement
            patterns, not speech correctness.
          </p>
        </div>
      </main>
    </div>
  );
}
