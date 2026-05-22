interface ScoreRingProps {
  score: number;  // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreRing({ score, size = 100, strokeWidth = 10, label }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;

  const color =
    score >= 70 ? "#22C55E" :
    score >= 50 ? "#F97316" :
    "#94A3B8";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800 leading-none">{score}</span>
        {label && <span className="text-xs font-semibold text-slate-500 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
