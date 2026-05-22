interface FeedbackBubbleProps {
  message: string;
  variant?: "default" | "success" | "info" | "warning";
}

const VARIANT_STYLES = {
  default: "bg-white border-slate-200 text-slate-700",
  success: "bg-green-50 border-green-300 text-green-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-300 text-amber-800",
};

const EMOJIS = {
  default: "💬",
  success: "🌱",
  info: "💡",
  warning: "⚠️",
};

export function FeedbackBubble({ message, variant = "default" }: FeedbackBubbleProps) {
  return (
    <div className={`relative rounded-2xl border-2 px-4 py-3 shadow-sm ${VARIANT_STYLES[variant]}`}>
      {/* Tail */}
      <div className={`absolute -top-3 left-6 w-4 h-3 overflow-hidden`}>
        <div className={`w-3 h-3 rotate-45 border-l-2 border-t-2 mx-auto mt-1 ${
          variant === "success" ? "border-green-300 bg-green-50" :
          variant === "info" ? "border-blue-200 bg-blue-50" :
          variant === "warning" ? "border-amber-300 bg-amber-50" :
          "border-slate-200 bg-white"
        }`} />
      </div>
      <p className="text-sm font-semibold leading-snug">
        <span className="mr-1.5">{EMOJIS[variant]}</span>
        {message}
      </p>
    </div>
  );
}
