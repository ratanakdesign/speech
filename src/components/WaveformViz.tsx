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
    : volume > 15
    ? "#F97316"
    : "#CBD5E1";

  return (
    <div className="flex items-center justify-center gap-[2px] h-10" aria-hidden="true">
      {bars.map((value, i) => {
        const barH = active ? Math.max(4, Math.round(value * 0.36)) : 4;
        return (
          <div
            key={i}
            className="rounded-full transition-all duration-75"
            style={{
              width: 3,
              height: barH,
              backgroundColor: barColor,
            }}
          />
        );
      })}
    </div>
  );
}
