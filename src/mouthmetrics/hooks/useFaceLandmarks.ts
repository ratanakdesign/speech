import { useEffect, useRef, useState, useCallback } from "react";
import type { NormalizedLandmark } from "../lib/scoring";

export type ModelStatus = "idle" | "loading" | "ready" | "error";

interface FaceLandmarkState {
  landmarks: NormalizedLandmark[] | null;
  faceDetected: boolean;
  modelStatus: ModelStatus;
  mouthVisible: boolean;
  errorMessage: string | null;
}

interface UseFaceLandmarksReturn extends FaceLandmarkState {
  landmarksRef: React.MutableRefObject<NormalizedLandmark[] | null>;
}

export function useFaceLandmarks(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean
): UseFaceLandmarksReturn {
  const [state, setState] = useState<FaceLandmarkState>({
    landmarks: null,
    faceDetected: false,
    modelStatus: "idle",
    mouthVisible: false,
    errorMessage: null,
  });

  const landmarkerRef = useRef<unknown>(null);
  const animFrameRef = useRef<number>(0);
  const landmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const startLoop = useCallback(() => {
    const loop = (time: number) => {
      if (!enabledRef.current) return;

      const video = videoRef.current;
      const lm = landmarkerRef.current as {
        detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: NormalizedLandmark[][] };
      } | null;

      if (video && lm && video.readyState >= 2 && !video.paused) {
        try {
          const results = lm.detectForVideo(video, time);
          const lmarks = results.faceLandmarks?.[0] ?? null;
          landmarksRef.current = lmarks;

          // Check mouth visibility using lower lip y-coordinate (landmark 17)
          const mouthVisible =
            lmarks !== null &&
            lmarks[17] !== undefined &&
            lmarks[17].y < 0.95 &&
            lmarks[17].y > 0.1;

          landmarksRef.current = lmarks;
          setState((prev) => ({
            ...prev,
            landmarks: lmarks,
            faceDetected: !!lmarks,
            mouthVisible,
          }));
        } catch {
          // Ignore per-frame inference errors
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [videoRef]);

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, modelStatus: "idle" }));
      return;
    }

    setState((prev) => ({ ...prev, modelStatus: "loading" }));

    let cancelled = false;

    (async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        const fl = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        if (cancelled) {
          fl.close();
          return;
        }

        landmarkerRef.current = fl;
        setState((prev) => ({ ...prev, modelStatus: "ready" }));
        startLoop();
      } catch (err) {
        if (!cancelled) {
          console.error("MediaPipe FaceLandmarker failed to load:", err);
          setState((prev) => ({
            ...prev,
            modelStatus: "error",
            errorMessage:
              "Could not load face tracking model. Switching to Demo Mode.",
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      const lm = landmarkerRef.current as { close?: () => void } | null;
      if (lm?.close) {
        try { lm.close(); } catch { /* ignore */ }
      }
      landmarkerRef.current = null;
    };
  }, [enabled, startLoop]);

  return { ...state, landmarksRef };
}
