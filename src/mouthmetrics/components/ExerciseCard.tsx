import React from "react";
import type { ExerciseDefinition } from "../types/exercise";

interface Props {
  exercise: ExerciseDefinition;
  onSelect: (exercise: ExerciseDefinition) => void;
  bestScore?: number;
  sessionCount?: number;
}

const difficultyColor = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

export function ExerciseCard({ exercise, onSelect, bestScore, sessionCount }: Props) {
  return (
    <button
      onClick={() => onSelect(exercise)}
      className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{exercise.emoji}</span>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[exercise.difficulty]}`}
        >
          {exercise.difficulty}
        </span>
      </div>

      <h3 className="font-semibold text-slate-900 text-lg mb-1 group-hover:text-indigo-700 transition-colors">
        {exercise.name}
      </h3>
      <p className="text-slate-500 text-sm mb-3">{exercise.description}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {exercise.tracks.map((t) => (
          <span
            key={t}
            className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
          >
            {t}
          </span>
        ))}
      </div>

      {(bestScore !== undefined || sessionCount !== undefined) && (
        <div className="flex gap-4 text-sm text-slate-500 border-t border-slate-100 pt-3">
          {sessionCount !== undefined && (
            <span>{sessionCount} session{sessionCount !== 1 ? "s" : ""}</span>
          )}
          {bestScore !== undefined && <span>Best: {bestScore}</span>}
        </div>
      )}

      <div className="mt-3 text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
        Start exercise →
      </div>
    </button>
  );
}
