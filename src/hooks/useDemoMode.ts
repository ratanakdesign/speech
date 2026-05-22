import { useCallback, useEffect, useRef, useState } from "react";
import type { MouthMetrics } from "../lib/geometry";

export interface DemoState {
  metrics: MouthMetrics;
  audioVolume: number;
  audioAttemptDetected: boolean;
  simulatedScore: number;
}

const DEMO_TICK_MS = 80;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function useDemoMode(active: boolean): {
  demoState: DemoState;
  triggerDemoAttempt: () => void;
  resetAudio: () => void;
} {
  const [demoState, setDemoState] = useState<DemoState>({
    metrics: { mouthWidth: 0.45, mouthOpening: 0.08, roundnessRatio: 0.18, symmetryScore: 85, faceDetected: true },
    audioVolume: 0,
    audioAttemptDetected: false,
    simulatedScore: 30,
  });

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const audioFlagRef = useRef(false);

  const triggerDemoAttempt = useCallback(() => {
    audioFlagRef.current = true;
    setTimeout(() => { audioFlagRef.current = false; }, 800);
    setDemoState((prev) => ({ ...prev, audioAttemptDetected: true, audioVolume: 75 }));
    setTimeout(() => {
      setDemoState((prev) => ({ ...prev, audioAttemptDetected: false, audioVolume: 0 }));
    }, 900);
  }, []);

  const resetAudio = useCallback(() => {
    setDemoState((prev) => ({ ...prev, audioAttemptDetected: false, audioVolume: 0 }));
  }, []);

  useEffect(() => {
    if (!active) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      phaseRef.current += 0.04;
      const p = phaseRef.current;
      const wave = Math.sin(p) * 0.5 + 0.5; // 0-1 oscillation
      const wave2 = Math.sin(p * 1.3 + 1) * 0.5 + 0.5;

      // Simulate lip rounding improving over time with variation
      const baseRoundedness = 0.5 + Math.sin(p * 0.3) * 0.3; // 0.2-0.8

      const mouthWidth = lerp(0.48, 0.22, baseRoundedness * wave2);
      const mouthOpening = lerp(0.02, 0.18, baseRoundedness * wave);
      const roundnessRatio = mouthWidth > 0.001 ? mouthOpening / mouthWidth : 0;
      const symmetryScore = 80 + wave * 15;
      const simulatedScore = Math.round(
        Math.max(0, Math.min(100, 30 + baseRoundedness * 65 + (wave - 0.5) * 20))
      );

      setDemoState((prev) => ({
        ...prev,
        metrics: { mouthWidth, mouthOpening, roundnessRatio, symmetryScore, faceDetected: true },
        simulatedScore,
      }));
    }, DEMO_TICK_MS);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [active]);

  return { demoState, triggerDemoAttempt, resetAudio };
}
