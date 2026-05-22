import type { FeedbackMode, VisibilityLevel } from "../types";

interface TargetBadgeProps {
  feedbackMode: FeedbackMode;
  visibility: VisibilityLevel;
  size?: "sm" | "md";
}

const MODE_LABELS: Record<FeedbackMode, string> = {
  audio_only: "Audio only",
  audio_plus_visual: "Audio + visual",
  visual_movement_only: "Visual only",
};

const MODE_COLORS: Record<FeedbackMode, string> = {
  audio_only: "bg-slate-100 text-slate-600 border-slate-200",
  audio_plus_visual: "bg-blue-50 text-blue-700 border-blue-200",
  visual_movement_only: "bg-purple-50 text-purple-700 border-purple-200",
};

const VIS_COLORS: Record<VisibilityLevel, string> = {
  high: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-rose-50 text-rose-600 border-rose-200",
};

const VIS_DOTS: Record<VisibilityLevel, string> = {
  high: "bg-green-500",
  partial: "bg-amber-500",
  low: "bg-rose-400",
};

export function TargetBadge({ feedbackMode, visibility, size = "md" }: TargetBadgeProps) {
  const textSize = size === "sm" ? "text-xs" : "text-xs";
  const px = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${textSize} ${px} ${MODE_COLORS[feedbackMode]}`}>
        {feedbackMode === "audio_only" ? "🎤" : feedbackMode === "audio_plus_visual" ? "🎤👁" : "👁"}
        {MODE_LABELS[feedbackMode]}
      </span>
      <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${textSize} ${px} ${VIS_COLORS[visibility]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${VIS_DOTS[visibility]}`} />
        {visibility} visibility
      </span>
    </div>
  );
}
