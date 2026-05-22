import React from "react";

interface Props {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: Props) {
  if (compact) {
    return (
      <p className="text-xs text-slate-400 text-center">
        MouthMetrics tracks visible movement behaviour. Not a clinical tool.
      </p>
    );
  }
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 flex gap-2">
      <span className="shrink-0 mt-0.5">ℹ️</span>
      <span>
        MouthMetrics tracks <strong>visible mouth movement</strong> during
        therapist-prescribed practice. It does not diagnose speech disorders or
        replace a speech pathologist.
      </span>
    </div>
  );
}
