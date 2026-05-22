import React from "react";

interface Props {
  label: string;
  value: string | number;
  subLabel?: string;
  highlight?: boolean;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({ label, value, subLabel, highlight, trend }: Props) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : null;
  const trendColor =
    trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide mb-1 ${
          highlight ? "text-indigo-200" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p className={`text-3xl font-bold tabular-nums leading-none ${highlight ? "text-white" : ""}`}>
        {value}
        {trendIcon && (
          <span className={`text-lg ml-1 ${trendColor}`}>{trendIcon}</span>
        )}
      </p>
      {subLabel && (
        <p className={`text-xs mt-1 ${highlight ? "text-indigo-200" : "text-slate-400"}`}>
          {subLabel}
        </p>
      )}
    </div>
  );
}
