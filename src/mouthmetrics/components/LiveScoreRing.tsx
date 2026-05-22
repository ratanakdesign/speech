import React from "react";
import { clamp } from "../lib/geometry";

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export function LiveScoreRing({ score, size = 120, label = "Score" }: Props) {
  const clamped = clamp(Math.round(score), 0, 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70
      ? "#10B981"
      : clamped >= 45
      ? "#6366F1"
      : "#94A3B8";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="drop-shadow-sm" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center"
        style={{ marginTop: -(size / 2 + 14) }}
      >
        <span className="text-3xl font-bold text-slate-900" style={{ lineHeight: 1 }}>
          {clamped}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}

export function LiveScoreRingInline({ score, size = 120, label = "Score" }: Props) {
  const clamped = clamp(Math.round(score), 0, 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70
      ? "#10B981"
      : clamped >= 45
      ? "#6366F1"
      : "#94A3B8";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-3xl font-bold text-slate-900" style={{ lineHeight: 1 }}>
          {clamped}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">{label}</span>
      </div>
    </div>
  );
}
