import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WaveformViz } from "./WaveformViz";
import type { AudioAnalysisState } from "../hooks/useAudioAnalysis";

interface Drop {
  id: number;
  x: number;
  scale: number;
}

interface VoiceWateringInteractionProps {
  audioState: AudioAnalysisState;
  currentWord: string;
  isDemoMode: boolean;
}

export function VoiceWateringInteraction({
  audioState,
  currentWord,
  isDemoMode,
}: VoiceWateringInteractionProps) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const dropIdRef = useRef(0);
  const prevAttemptRef = useRef(false);

  const { volume, waveformData, isAttemptDetected, active, permissionDenied } = audioState;
  const isLoud = volume > 25;

  useEffect(() => {
    if (isAttemptDetected && !prevAttemptRef.current) {
      const burst: Drop[] = Array.from({ length: 5 }, (_, i) => ({
        id: dropIdRef.current++,
        x: (i - 2) * 32 + (Math.random() - 0.5) * 18,
        scale: 0.7 + Math.random() * 0.5,
      }));
      setDrops((d) => [...d, ...burst]);
      const ids = new Set(burst.map((b) => b.id));
      setTimeout(() => setDrops((d) => d.filter((dd) => !ids.has(dd.id))), 1400);
    }
    prevAttemptRef.current = isAttemptDetected;
  }, [isAttemptDetected]);

  if (permissionDenied) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 flex flex-col items-center gap-2 text-center">
        <span className="text-3xl">🎤</span>
        <p className="font-black text-amber-700 text-sm">Microphone needed</p>
        <p className="text-amber-600 text-xs font-semibold leading-snug">
          Allow microphone access and reload the page to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Water drops — fly upward on attempt */}
      <AnimatePresence>
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute pointer-events-none select-none"
            style={{ x: drop.x, fontSize: `${drop.scale * 22}px` }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -110, opacity: 0 }}
            exit={{}}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            💧
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mic button with pulse rings */}
      <div className="relative flex items-center justify-center">
        {active && (
          <>
            <motion.div
              className="absolute rounded-full border-2 border-orange-300"
              style={{ width: 108, height: 108 }}
              animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute rounded-full border border-orange-200"
              style={{ width: 108, height: 108 }}
              animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}

        <motion.div
          className={`w-[84px] h-[84px] rounded-full flex items-center justify-center shadow-xl transition-colors duration-200 ${
            isAttemptDetected
              ? "bg-green-400 shadow-green-200"
              : isLoud
              ? "bg-orange-400 shadow-orange-200"
              : "bg-orange-500 shadow-orange-200"
          }`}
          animate={
            isAttemptDetected
              ? { scale: [1, 1.14, 0.97, 1] }
              : isLoud
              ? { scale: [1, 1.06, 1] }
              : { scale: 1 }
          }
          transition={
            isAttemptDetected
              ? { duration: 0.45, times: [0, 0.3, 0.7, 1] }
              : isLoud
              ? { duration: 0.28, repeat: Infinity, repeatType: "mirror" }
              : {}
          }
        >
          <span className="text-3xl">{isAttemptDetected ? "💧" : "🎤"}</span>
        </motion.div>
      </div>

      {/* Waveform */}
      <div className="bg-white/90 rounded-2xl px-6 py-3 border border-orange-100 shadow-sm w-full">
        <WaveformViz
          waveformData={waveformData}
          volume={volume}
          active={active}
          isAttemptDetected={isAttemptDetected}
        />
      </div>

      {/* Status label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={isAttemptDetected ? "heard" : active ? "listening" : "ready"}
          className={`text-sm font-black text-center transition-colors ${
            isAttemptDetected
              ? "text-green-600"
              : active
              ? "text-orange-500"
              : "text-slate-400"
          }`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {isAttemptDetected
            ? "Your voice watered the sprout! 💧"
            : active
            ? `Say "${currentWord}" out loud!`
            : "Get ready…"}
        </motion.p>
      </AnimatePresence>

      {isDemoMode && (
        <p className="text-[10px] font-semibold text-slate-400 -mt-2">
          Demo mode — will auto-complete ✨
        </p>
      )}
    </div>
  );
}
