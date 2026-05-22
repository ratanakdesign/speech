import { useCallback, useEffect, useRef, useState } from "react";
import { computeMouthMetrics, type MouthMetrics } from "../lib/geometry";

export type LandmarkStatus = "idle" | "loading" | "ready" | "no-face" | "error";

interface UseFaceLandmarksResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  metrics: MouthMetrics;
  status: LandmarkStatus;
  permissionDenied: boolean;
}

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

const EMPTY_METRICS: MouthMetrics = {
  mouthWidth: 0,
  mouthOpening: 0,
  roundnessRatio: 0,
  symmetryScore: 0,
  faceDetected: false,
};

export function useFaceLandmarks(active: boolean): UseFaceLandmarksResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<unknown>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [metrics, setMetrics] = useState<MouthMetrics>(EMPTY_METRICS);
  const [status, setStatus] = useState<LandmarkStatus>("idle");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopCamera = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const drawLandmarks = useCallback((landmarks: { x: number; y: number }[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw subtle mouth region landmarks
    const mouthIndices = [61, 291, 13, 14, 78, 308, 82, 312, 87, 317, 95, 324];
    ctx.fillStyle = "rgba(249,115,22,0.7)";
    for (const idx of mouthIndices) {
      const pt = landmarks[idx];
      if (!pt) continue;
      ctx.beginPath();
      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth outline
    const outline = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
    ctx.strokeStyle = "rgba(249,115,22,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    outline.forEach((idx, i) => {
      const pt = landmarks[idx];
      if (!pt) return;
      if (i === 0) ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
      else ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
    });
    ctx.stroke();
  }, []);

  useEffect(() => {
    if (!active) {
      stopCamera();
      setStatus("idle");
      setMetrics(EMPTY_METRICS);
      return;
    }

    let cancelled = false;

    async function init() {
      setStatus("loading");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (cancelled) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setStatus("ready");

        let lastTime = -1;
        function loop() {
          const video = videoRef.current;
          if (!video || cancelled) return;
          if (video.readyState >= 2 && video.currentTime !== lastTime) {
            lastTime = video.currentTime;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = (landmarkerRef.current as any).detectForVideo(video, performance.now());
            if (result.faceLandmarks && result.faceLandmarks.length > 0) {
              const lm = result.faceLandmarks[0];
              drawLandmarks(lm);
              setMetrics(computeMouthMetrics(lm));
              setStatus("ready");
            } else {
              setMetrics(EMPTY_METRICS);
              setStatus("no-face");
              const canvas = canvasRef.current;
              if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
          animRef.current = requestAnimationFrame(loop);
        }
        animRef.current = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelled) return;
        const msg = String(err);
        if (msg.includes("NotAllowed") || msg.includes("Permission")) {
          setPermissionDenied(true);
          setStatus("error");
        } else {
          setStatus("error");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [active, stopCamera, drawLandmarks]);

  return { videoRef, canvasRef, metrics, status, permissionDenied };
}
