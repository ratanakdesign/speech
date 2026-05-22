import type { PlantStage } from "../types";

interface PlantIllustrationProps {
  stage: PlantStage;
  size?: number;
  animate?: boolean;
}

export function PlantIllustration({ stage, size = 120, animate = false }: PlantIllustrationProps) {
  const cls = animate ? "transition-all duration-700 ease-out" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cls}
      aria-label={`Plant stage ${stage}`}
    >
      {/* Soil base */}
      <ellipse cx="60" cy="108" rx="38" ry="10" fill="#A0522D" opacity="0.35" />
      <rect x="30" y="100" width="60" height="12" rx="6" fill="#8B6344" opacity="0.5" />

      {stage === 0 && (
        // Seed
        <>
          <ellipse cx="60" cy="100" rx="8" ry="6" fill="#6B4226" />
          <ellipse cx="57" cy="98" rx="2" ry="1.5" fill="#8B5E3C" opacity="0.6" />
        </>
      )}

      {stage === 1 && (
        // Sprout — tiny shoot
        <>
          <line x1="60" y1="100" x2="60" y2="75" stroke="#4CAF50" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="52" cy="78" rx="9" ry="5" fill="#66BB6A" transform="rotate(-30 52 78)" />
          <ellipse cx="68" cy="76" rx="9" ry="5" fill="#81C784" transform="rotate(30 68 76)" />
        </>
      )}

      {stage === 2 && (
        // Small plant — taller with more leaves
        <>
          <line x1="60" y1="100" x2="60" y2="55" stroke="#388E3C" strokeWidth="3.5" strokeLinecap="round" />
          {/* Bottom leaves */}
          <ellipse cx="46" cy="85" rx="12" ry="6" fill="#66BB6A" transform="rotate(-40 46 85)" />
          <ellipse cx="74" cy="82" rx="12" ry="6" fill="#81C784" transform="rotate(35 74 82)" />
          {/* Middle leaves */}
          <ellipse cx="48" cy="68" rx="11" ry="5.5" fill="#4CAF50" transform="rotate(-35 48 68)" />
          <ellipse cx="72" cy="65" rx="11" ry="5.5" fill="#66BB6A" transform="rotate(30 72 65)" />
        </>
      )}

      {stage === 3 && (
        // Bud — stem with closed flower bud
        <>
          <line x1="60" y1="100" x2="60" y2="45" stroke="#2E7D32" strokeWidth="3.5" strokeLinecap="round" />
          {/* Leaves */}
          <ellipse cx="44" cy="80" rx="13" ry="6" fill="#66BB6A" transform="rotate(-40 44 80)" />
          <ellipse cx="76" cy="77" rx="13" ry="6" fill="#81C784" transform="rotate(35 76 77)" />
          <ellipse cx="46" cy="62" rx="11" ry="5" fill="#4CAF50" transform="rotate(-30 46 62)" />
          {/* Bud */}
          <ellipse cx="60" cy="42" rx="8" ry="11" fill="#FF8A65" />
          <ellipse cx="60" cy="37" rx="7" ry="6" fill="#FFAB91" />
          {/* Sepals */}
          <ellipse cx="53" cy="46" rx="4" ry="7" fill="#388E3C" transform="rotate(-20 53 46)" />
          <ellipse cx="67" cy="46" rx="4" ry="7" fill="#4CAF50" transform="rotate(20 67 46)" />
        </>
      )}

      {stage === 4 && (
        // Full bloom
        <>
          <line x1="60" y1="100" x2="60" y2="50" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
          {/* Leaves */}
          <ellipse cx="43" cy="82" rx="14" ry="6.5" fill="#66BB6A" transform="rotate(-40 43 82)" />
          <ellipse cx="77" cy="79" rx="14" ry="6.5" fill="#81C784" transform="rotate(35 77 79)" />
          <ellipse cx="45" cy="65" rx="12" ry="5.5" fill="#4CAF50" transform="rotate(-30 45 65)" />
          {/* Petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const px = 60 + Math.cos(rad) * 16;
            const py = 42 + Math.sin(rad) * 16;
            return (
              <ellipse
                key={i}
                cx={px}
                cy={py}
                rx="7"
                ry="5"
                fill={i % 2 === 0 ? "#FF7043" : "#FFAB40"}
                transform={`rotate(${angle} ${px} ${py})`}
              />
            );
          })}
          {/* Center */}
          <circle cx="60" cy="42" r="9" fill="#FDD835" />
          <circle cx="60" cy="42" r="5" fill="#F9A825" />
          {/* Sparkles */}
          <text x="88" y="28" fontSize="12">✨</text>
          <text x="18" y="35" fontSize="10">⭐</text>
        </>
      )}
    </svg>
  );
}
