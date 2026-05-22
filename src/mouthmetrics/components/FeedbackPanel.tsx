import React from "react";

interface Props {
  message: string;
  score: number;
}

export function FeedbackPanel({ message, score }: Props) {
  const isPositive = score >= 60;
  const isComplete = message.includes("complete");

  const bgColor = isComplete
    ? "bg-emerald-50 border-emerald-200"
    : isPositive
    ? "bg-indigo-50 border-indigo-200"
    : "bg-slate-100 border-slate-200";

  const textColor = isComplete
    ? "text-emerald-700"
    : isPositive
    ? "text-indigo-700"
    : "text-slate-600";

  const icon = isComplete ? "✓" : isPositive ? "●" : "○";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColor} transition-colors duration-300`}
    >
      <span className={`text-lg ${textColor}`}>{icon}</span>
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
    </div>
  );
}
