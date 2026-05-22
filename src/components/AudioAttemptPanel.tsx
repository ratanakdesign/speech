import { WaveformViz } from "./WaveformViz";
import type { AudioAnalysisState } from "../hooks/useAudioAnalysis";

interface AudioAttemptPanelProps {
  audioState: AudioAnalysisState;
  currentWord: string;
  isDemoMode: boolean;
  phase: string;
}

export function AudioAttemptPanel({ audioState, currentWord, isDemoMode, phase }: AudioAttemptPanelProps) {
  const { volume, waveformData, isAttemptDetected, active, permissionDenied } = audioState;

  if (permissionDenied) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full text-center">
        <p className="text-amber-700 font-semibold text-sm">🎤 Microphone access needed</p>
        <p className="text-amber-600 text-xs mt-1">
          Please allow microphone access, then reload the page.
        </p>
        {isDemoMode && (
          <p className="text-amber-500 text-xs mt-1">Or use Demo Mode — no microphone needed!</p>
        )}
      </div>
    );
  }

  const statusLabel = isAttemptDetected
    ? "Nice effort! 🎵"
    : active && volume > 15
    ? "Hearing you…"
    : phase === "listening"
    ? "Say the word loudly!"
    : "Ready";

  return (
    <div className="bg-white rounded-3xl shadow-md shadow-orange-100 border border-orange-100 p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`relative w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${
              volume > 20 ? "bg-orange-100" : "bg-slate-100"
            }`}
          >
            🎤
            {volume > 30 && (
              <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping" />
            )}
          </div>
          <div>
            <p
              className={`text-xs font-bold transition-colors ${
                isAttemptDetected ? "text-green-600" : "text-slate-500"
              }`}
            >
              {statusLabel}
            </p>
          </div>
        </div>
        {isDemoMode && (
          <span className="bg-slate-800 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
            DEMO
          </span>
        )}
      </div>

      <WaveformViz
        waveformData={waveformData}
        volume={volume}
        active={active}
        isAttemptDetected={isAttemptDetected}
      />

      <p className="text-xs text-slate-400 text-center mt-2">
        Say{" "}
        <span className="font-bold text-slate-600">
          &ldquo;{currentWord}&rdquo;
        </span>{" "}
        out loud
      </p>
    </div>
  );
}
