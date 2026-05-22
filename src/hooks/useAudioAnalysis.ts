import { useCallback, useEffect, useRef, useState } from "react";

const FFT_SIZE = 64; // 32 frequency bins
const WAVEFORM_BINS = 32;
const ATTEMPT_THRESHOLD = 22;
const ATTEMPT_DURATION_MS = 400;
const DEMO_AUTO_TRIGGER_MS = 2400;

export interface AudioAnalysisState {
  volume: number;
  waveformData: number[];
  spectralCentroid: number;
  highFrequencyEnergy: number;
  isAttemptDetected: boolean;
  attemptDurationMs: number;
  active: boolean;
  permissionDenied: boolean;
}

const IDLE_WAVEFORM = new Array(WAVEFORM_BINS).fill(0);

const INITIAL_STATE: AudioAnalysisState = {
  volume: 0,
  waveformData: IDLE_WAVEFORM,
  spectralCentroid: 0,
  highFrequencyEnergy: 0,
  isAttemptDetected: false,
  attemptDurationMs: 0,
  active: false,
  permissionDenied: false,
};

function buildWaveform(data: Uint8Array): number[] {
  const step = Math.max(1, Math.floor(data.length / WAVEFORM_BINS));
  return Array.from({ length: WAVEFORM_BINS }, (_, i) => {
    const start = i * step;
    const slice = data.slice(start, start + step);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return Math.min(100, Math.round((avg / 255) * 100));
  });
}

function computeSpectralCentroid(data: Uint8Array): number {
  let num = 0;
  let den = 0;
  for (let i = 0; i < data.length; i++) {
    num += i * data[i];
    den += data[i];
  }
  if (den === 0) return 0;
  return Math.round(((num / den) / data.length) * 100);
}

function computeHighFrequencyEnergy(data: Uint8Array): number {
  const start = Math.floor((data.length * 2) / 3);
  const total = data.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const hf = data.slice(start).reduce((a, b) => a + b, 0);
  return Math.round((hf / total) * 100);
}

export function useAudioAnalysis(
  enabled: boolean,
  simulateAttempts = false
): {
  audioState: AudioAnalysisState;
  resetAttempt: () => void;
} {
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [audioState, setAudioState] = useState<AudioAnalysisState>(INITIAL_STATE);

  const resetAttempt = useCallback(() => {
    setAudioState((prev) => ({ ...prev, isAttemptDetected: false, attemptDurationMs: 0 }));
  }, []);

  const stopAll = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    if (ctxRef.current) ctxRef.current.close().catch(() => {});
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    ctxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    demoIntervalRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopAll();
      setAudioState(INITIAL_STATE);
      return;
    }

    if (simulateAttempts) {
      const startTime = Date.now();
      let attemptFired = false;

      demoIntervalRef.current = setInterval(() => {
        const t = Date.now() / 800;
        const base = 35 + Math.sin(t * 1.3) * 22;
        const waveformData = Array.from({ length: WAVEFORM_BINS }, (_, i) => {
          const val = Math.sin(t * (1.2 + i * 0.08)) * 22 + base + Math.random() * 8;
          return Math.max(0, Math.min(100, val));
        });
        const volume = Math.max(0, Math.min(100, base + Math.random() * 8));
        const elapsed = Date.now() - startTime;

        if (!attemptFired && elapsed >= DEMO_AUTO_TRIGGER_MS) {
          attemptFired = true;
        }

        setAudioState({
          volume,
          waveformData,
          spectralCentroid: 40 + Math.random() * 25,
          highFrequencyEnergy: 25 + Math.random() * 20,
          isAttemptDetected: attemptFired,
          attemptDurationMs: attemptFired ? ATTEMPT_DURATION_MS : 0,
          active: true,
          permissionDenied: false,
        });
      }, 80);

      return () => {
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      };
    }

    // Real microphone
    let cancelled = false;
    let aboveThresholdStart: number | null = null;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        function loop() {
          if (cancelled || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(data);

          const rawVol = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
          const volume = Math.min(100, rawVol * 2);
          const waveformData = buildWaveform(data);
          const spectralCentroid = computeSpectralCentroid(data);
          const highFrequencyEnergy = computeHighFrequencyEnergy(data);
          const now = Date.now();

          if (rawVol >= ATTEMPT_THRESHOLD) {
            if (aboveThresholdStart === null) aboveThresholdStart = now;
            const elapsed = now - aboveThresholdStart;
            setAudioState({
              volume,
              waveformData,
              spectralCentroid,
              highFrequencyEnergy,
              isAttemptDetected: elapsed >= ATTEMPT_DURATION_MS,
              attemptDurationMs: elapsed,
              active: true,
              permissionDenied: false,
            });
          } else {
            aboveThresholdStart = null;
            setAudioState((prev) => ({
              ...prev,
              volume,
              waveformData,
              spectralCentroid,
              highFrequencyEnergy,
              isAttemptDetected: false,
              attemptDurationMs: 0,
              active: true,
            }));
          }

          animRef.current = requestAnimationFrame(loop);
        }
        animRef.current = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelled) return;
        if (String(err).includes("NotAllowed") || String(err).includes("Permission")) {
          setAudioState({ ...INITIAL_STATE, permissionDenied: true });
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      stopAll();
    };
  }, [enabled, simulateAttempts, stopAll]);

  return { audioState, resetAttempt };
}
