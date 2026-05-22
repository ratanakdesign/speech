import React from "react";
import { REPS_PER_SESSION } from "../lib/scoring";

interface Props {
  repCount: number;
}

export function RepProgress({ repCount }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 font-medium w-8 shrink-0">Reps</span>
      <div className="flex gap-2 flex-1">
        {Array.from({ length: REPS_PER_SESSION }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
              i < repCount ? "bg-indigo-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-slate-700 tabular-nums">
        {repCount}/{REPS_PER_SESSION}
      </span>
    </div>
  );
}
