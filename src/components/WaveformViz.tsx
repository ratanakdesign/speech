import { motion } from "framer-motion";

const BAR_COUNT = 24;

interface WaveformVizProps {
  waveformData: number[];
  volume: number;
  active: boolean;
  isAttemptDetected: boolean;
}

export function WaveformViz({ waveformData, volume, active, isAttemptDetected }: WaveformVizProps) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const srcIdx = Math.floor((i / BAR_COUNT) * waveformData.length);
    return waveformData[srcIdx] ?? 0;
  });

  const barColor = isAttemptDetected
    ? "#22C55E"
    : volume > 20
    ? "#F97316"
    : "#CBD5E1";

  return (
    <div className="flex items-end justify-center gap-[3px] h-10" aria-hidden="true">
      {bars.map((value, i) => {
        const activeH = Math.max(4, Math.round(value * 0.36));
        // Each bar gets a unique idle envelope — organic, not mechanical
        const idleBase = 3 + Math.round(Math.abs(Math.sin(i * 0.71)) * 2);
        const idlePeak = idleBase + 4 + Math.round(Math.abs(Math.sin(i * 0.43)) * 5);

        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 3, backgroundColor: barColor }}
            animate={{
              height: active ? activeH : [idleBase, idlePeak, idleBase],
              backgroundColor: barColor,
            }}
            transition={
              active
                ? {
                    height: { type: "spring", stiffness: 380, damping: 26 },
                    backgroundColor: { duration: 0.22 },
                  }
                : {
                    height: {
                      duration: 1.25 + (i % 7) * 0.14,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                      delay: i * 0.068,
                    },
                    backgroundColor: { duration: 0.22 },
                  }
            }
          />
        );
      })}
    </div>
  );
}
