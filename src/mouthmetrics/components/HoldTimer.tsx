import React from "react";
import { clamp } from "../lib/geometry";
import { HOLD_DURATION_MS } from "../lib/scoring";

interface Props {
  holdProgressMs: number;
  isHolding: boolean;
}

export function HoldTimer({ holdProgressMs, isHolding }: Props) {
  const progress = clamp(holdProgressMs / HOLD_DURATION_MS, 0, 1);
  const seconds = (holdProgressMs / 1000).toFixed(1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 font-medium">Hold timer</span>
        {isHolding && (
          <span className="text-indigo-600 font-semibold tabular-nums">{seconds}s</span>
        )}
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: isHolding ? (progress >= 1 ? "#10B981" : "#6366F1") : "#CBD5E1",
          }}
        />
      </div>
      <p className="text-xs text-slate-400">
        {isHolding ? `Hold for ${HOLD_DURATION_MS / 1000}s to complete rep` : "Hold shape above threshold to start timer"}
      </p>
    </div>
  );
}
