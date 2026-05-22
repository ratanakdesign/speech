interface WaterDropsProps {
  total: number;
  filled: number;
}

export function WaterDrops({ total, filled }: WaterDropsProps) {
  return (
    <div className="flex gap-2 items-center justify-center flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`text-2xl transition-all duration-300 ${
            i < filled ? "opacity-100 scale-110" : "opacity-25 grayscale"
          }`}
          style={{ filter: i >= filled ? "grayscale(1)" : undefined }}
        >
          💧
        </span>
      ))}
    </div>
  );
}
