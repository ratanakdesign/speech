import { motion } from "framer-motion";
import { WaveformViz } from "./WaveformViz";
import type { AudioAnalysisState } from "../hooks/useAudioAnalysis";

interface AudioAttemptPanelProps {
  audioState: AudioAnalysisState;
  currentWord: string;
  isDemoMode: boolean;
  phase: string;
}

export function AudioAttemptPanel({
  audioState,
  currentWord,
  isDemoMode,
  phase,
}: AudioAttemptPanelProps) {
  const { volume, waveformData, isAttemptDetected, active, permissionDenied } = audioState;

  if (permissionDenied) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full text-center">
        <p className="text-amber-700 font-black text-sm">🎤 Microphone needed</p>
        <p className="text-amber-600 text-xs font-semibold mt-1">
          Allow microphone access and reload to continue.
        </p>
      </div>
    );
  }

  const statusText = isAttemptDetected
    ? "Heard you! Keep going 🎶"
    : active && volume > 15
    ? "Listening…"
    : phase === "listening"
    ? "Say the word loudly"
    : "Ready";

  const isLoud = volume > 25;

  return (
    <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-100/50 p-5 w-full">
      {/* Top row: mic icon + status + demo badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-colors ${
                isAttemptDetected ? "bg-green-100" : isLoud ? "bg-orange-100" : "bg-slate-100"
              }`}
              animate={isLoud ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={
                isLoud
                  ? { duration: 0.3, repeat: Infinity, repeatType: "mirror" }
                  : { duration: 0.2 }
              }
            >
              🎤
            </motion.div>
            {isAttemptDetected && (
              <motion.div
                className="absolute -inset-1 rounded-2xl border-2 border-green-400"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </div>
          <p
            className={`text-sm font-bold transition-colors ${
              isAttemptDetected ? "text-green-600" : "text-slate-500"
            }`}
          >
            {statusText}
          </p>
        </div>
        {isDemoMode && (
          <span className="bg-slate-800 text-white text-[10px] font-black rounded-full px-2.5 py-1">
            DEMO
          </span>
        )}
      </div>

      {/* Waveform */}
      <div className="bg-slate-50 rounded-2xl py-3 px-4">
        <WaveformViz
          waveformData={waveformData}
          volume={volume}
          active={active}
          isAttemptDetected={isAttemptDetected}
        />
      </div>

      {/* Word reminder */}
      <p className="text-xs font-semibold text-slate-400 text-center mt-3">
        Say{" "}
        <span className="font-black text-slate-600 text-sm">&ldquo;{currentWord}&rdquo;</span>{" "}
        as clearly as you can
      </p>
    </div>
  );
}
