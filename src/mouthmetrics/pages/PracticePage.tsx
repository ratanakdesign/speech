import React, { useEffect, useRef, useState, useCallback } from "react";
import { useFaceLandmarks } from "../hooks/useFaceLandmarks";
import { useExerciseScoring } from "../hooks/useExerciseScoring";
import { useDemoMode } from "../hooks/useDemoMode";
import { LandmarkOverlay } from "../components/LandmarkOverlay";
import { LiveScoreRingInline } from "../components/LiveScoreRing";
import { HoldTimer } from "../components/HoldTimer";
import { FeedbackPanel } from "../components/FeedbackPanel";
import { RepProgress } from "../components/RepProgress";
import type { ExerciseDefinition, ExerciseSession } from "../types/exercise";

type CameraStatus = "requesting" | "granted" | "denied";

interface Props {
  exercise: ExerciseDefinition;
  onComplete: (session: ExerciseSession) => void;
  onBack: () => void;
}

export function PracticePage({ exercise, onComplete, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("requesting");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  // Real CV tracking (only when camera granted and not in demo mode)
  const cvEnabled = cameraStatus === "granted" && !isDemoMode && started;
  const {
    landmarks,
    faceDetected,
    modelStatus,
    mouthVisible,
    errorMessage: cvError,
  } = useFaceLandmarks(videoRef, cvEnabled);

  // Scoring from real landmarks
  const {
    score: realScore,
    feedback: realFeedback,
    holdProgressMs: realHoldMs,
    repCount: realRepCount,
    completedReps: realReps,
    isHolding: realIsHolding,
    sessionComplete: realComplete,
    metrics: realMetrics,
    buildSession,
  } = useExerciseScoring(
    cvEnabled && faceDetected ? landmarks : null,
    exercise.type,
    faceDetected
  );

  // Demo mode
  const {
    score: demoScore,
    feedback: demoFeedback,
    holdProgressMs: demoHoldMs,
    repCount: demoRepCount,
    sessionComplete: demoComplete,
    metrics: demoMetrics,
    buildDemoSession,
  } = useDemoMode(isDemoMode && started, exercise.type);

  // Unified values depending on mode
  const score = isDemoMode ? demoScore : realScore;
  const feedback = isDemoMode ? demoFeedback : (started ? realFeedback : exercise.instruction);
  const holdProgressMs = isDemoMode ? demoHoldMs : realHoldMs;
  const repCount = isDemoMode ? demoRepCount : realRepCount;
  const isHolding = isDemoMode ? holdProgressMs > 0 : realIsHolding;
  const metrics = isDemoMode ? demoMetrics : realMetrics;
  const sessionComplete = isDemoMode ? demoComplete : realComplete;

  // When model fails to load, switch to demo
  useEffect(() => {
    if (cvError) {
      setModelError(cvError);
      setIsDemoMode(true);
    }
  }, [cvError]);

  // Camera permission
  useEffect(() => {
    let active = true;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } } })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus("granted");
      })
      .catch(() => {
        if (active) {
          setCameraStatus("denied");
          setIsDemoMode(true);
        }
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Session completion
  useEffect(() => {
    if (!sessionComplete) return;
    const session = isDemoMode
      ? buildDemoSession(exercise)
      : buildSession(exercise, false);
    // Small delay so user sees the completion feedback
    const t = setTimeout(() => onComplete(session), 1200);
    return () => clearTimeout(t);
  }, [sessionComplete, isDemoMode, exercise, buildDemoSession, buildSession, onComplete]);

  const handleSwitchToDemo = useCallback(() => {
    setIsDemoMode(true);
  }, []);

  const statusIndicators = [
    { label: "Face detected", ok: isDemoMode || faceDetected },
    { label: "Mouth visible", ok: isDemoMode || mouthVisible },
    {
      label: "Tracking active",
      ok: isDemoMode || (modelStatus === "ready" && faceDetected),
    },
  ];

  const showModelLoading = !isDemoMode && cameraStatus === "granted" && modelStatus === "loading";
  const showCameraDenied = cameraStatus === "denied";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <button onClick={onBack} className="text-slate-300 hover:text-white text-sm">
          ← Stop
        </button>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">{exercise.name}</p>
          {isDemoMode && (
            <span className="text-xs bg-amber-500/80 text-white px-2 py-0.5 rounded-full">
              Demo Mode
            </span>
          )}
        </div>
        <div className="w-16" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: webcam */}
        <div className="lg:flex-1 flex flex-col">
          {/* Camera denied state */}
          {showCameraDenied && (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-800 gap-4 p-8 text-center">
              <div className="text-5xl">📷</div>
              <div>
                <p className="text-white font-semibold mb-2">Camera access needed</p>
                <p className="text-slate-400 text-sm max-w-xs">
                  Camera access is needed to track visible mouth movement. Running in
                  Demo Mode so you can still see the full flow.
                </p>
              </div>
            </div>
          )}

          {/* Webcam container */}
          {!showCameraDenied && (
            <div className="relative bg-slate-900 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Landmark overlay */}
              {landmarks && !isDemoMode && (
                <LandmarkOverlay landmarks={landmarks} score={score} />
              )}

              {/* Demo animated overlay */}
              {isDemoMode && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <div
                      className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-pulse"
                      style={{ borderRadius: "45% 55% 55% 45% / 60% 60% 40% 40%" }}
                    />
                    <div
                      className="absolute inset-4 rounded-full border-2 border-indigo-300/40 animate-pulse"
                      style={{
                        borderRadius: "45% 55% 55% 45% / 60% 60% 40% 40%",
                        animationDelay: "0.3s",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      {exercise.emoji}
                    </div>
                  </div>
                </div>
              )}

              {/* Model loading overlay */}
              {showModelLoading && (
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-sm">Loading face tracking model…</p>
                  <button
                    onClick={handleSwitchToDemo}
                    className="text-xs text-slate-300 underline"
                  >
                    Use Demo Mode instead
                  </button>
                </div>
              )}

              {/* Status indicators (bottom-left of video) */}
              <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                {statusIndicators.map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`}
                    />
                    <span className="text-xs text-white/80 drop-shadow">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruction banner below video */}
          <div className="bg-slate-800 px-4 py-3 text-center">
            <p className="text-slate-200 text-sm font-medium">{exercise.instruction}</p>
          </div>
        </div>

        {/* Right: controls panel */}
        <div className="lg:w-72 xl:w-80 bg-white flex flex-col p-5 gap-5">
          {/* Start button */}
          {!started && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStarted(true)}
                disabled={cameraStatus === "requesting"}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-lg shadow-lg shadow-indigo-200"
              >
                {cameraStatus === "requesting" ? "Setting up camera…" : "Begin Exercise"}
              </button>
              {cameraStatus === "denied" && !isDemoMode && (
                <p className="text-xs text-slate-400 text-center">
                  No camera — will run in Demo Mode
                </p>
              )}
            </div>
          )}

          {started && (
            <>
              {/* Live score ring */}
              <div className="flex justify-center">
                <LiveScoreRingInline score={score} size={140} />
              </div>

              {/* Feedback */}
              <FeedbackPanel message={feedback} score={score} />

              {/* Hold timer */}
              <HoldTimer holdProgressMs={holdProgressMs} isHolding={isHolding} />

              {/* Rep progress */}
              <RepProgress repCount={repCount} />

              {/* Metrics row */}
              {(metrics.symmetryScore > 0 || isDemoMode) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Symmetry</p>
                    <p className="text-xl font-bold text-slate-900">{metrics.symmetryScore}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Stability</p>
                    <p className="text-xl font-bold text-slate-900">{metrics.stabilityScore}</p>
                  </div>
                </div>
              )}

              {/* Model error / demo switch notice */}
              {modelError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  {modelError}
                </div>
              )}
            </>
          )}

          {/* Switch to demo option */}
          {!isDemoMode && cameraStatus === "granted" && !started && (
            <button
              onClick={handleSwitchToDemo}
              className="text-xs text-slate-400 hover:text-slate-600 text-center"
            >
              No webcam? Use Demo Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
