import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioState {
  volume: number;        // 0-100
  attemptDetected: boolean;
  active: boolean;
  permissionDenied: boolean;
}

const ATTEMPT_THRESHOLD = 22;
const ATTEMPT_DURATION_MS = 400;

export function useAudioDetection(enabled: boolean): {
  audioState: AudioState;
  resetAttempt: () => void;
} {
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);
  const attemptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [audioState, setAudioState] = useState<AudioState>({
    volume: 0,
    attemptDetected: false,
    active: false,
    permissionDenied: false,
  });

  const stopAudio = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (attemptTimerRef.current) clearTimeout(attemptTimerRef.current);
    if (ctxRef.current) ctxRef.current.close().catch(() => {});
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    ctxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
  }, []);

  const resetAttempt = useCallback(() => {
    setAudioState((prev) => ({ ...prev, attemptDetected: false }));
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopAudio();
      setAudioState({ volume: 0, attemptDetected: false, active: false, permissionDenied: false });
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        let aboveThresholdStart: number | null = null;

        function loop() {
          if (cancelled || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(data);
          const vol = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
          const now = Date.now();

          if (vol >= ATTEMPT_THRESHOLD) {
            if (aboveThresholdStart === null) aboveThresholdStart = now;
            if (now - aboveThresholdStart >= ATTEMPT_DURATION_MS) {
              setAudioState({ volume: Math.min(100, vol * 2), attemptDetected: true, active: true, permissionDenied: false });
            } else {
              setAudioState((prev) => ({ ...prev, volume: Math.min(100, vol * 2), active: true }));
            }
          } else {
            aboveThresholdStart = null;
            setAudioState((prev) => ({ ...prev, volume: Math.min(100, vol * 2), active: true }));
          }
          animRef.current = requestAnimationFrame(loop);
        }
        animRef.current = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelled) return;
        const msg = String(err);
        if (msg.includes("NotAllowed") || msg.includes("Permission")) {
          setAudioState({ volume: 0, attemptDetected: false, active: false, permissionDenied: true });
        }
      }
    }

    init();
    return () => { cancelled = true; stopAudio(); };
  }, [enabled, stopAudio]);

  return { audioState, resetAttempt };
}
