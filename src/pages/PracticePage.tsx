import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlantIllustration } from "../components/PlantIllustration";
import { WaterDrops } from "../components/WaterDrops";
import { ScoreRing } from "../components/ScoreRing";
import { FeedbackBubble } from "../components/FeedbackBubble";
import { AudioAttemptPanel } from "../components/AudioAttemptPanel";
import { useFaceLandmarks } from "../hooks/useFaceLandmarks";
import { useAudioAnalysis } from "../hooks/useAudioAnalysis";
import { useDemoMode } from "../hooks/useDemoMode";
import { computeLipRoundingScore, HOLD_DURATION_MS } from "../lib/scoring";
import type {
  ChildProfile,
  MapModule,
  PlantStage,
  PracticeAttempt,
  PracticeSession,
  SpeechTarget,
} from "../types";

const TOTAL_ATTEMPTS = 5;
const AUDIO_FEEDBACK = [
  "Great effort! 🎉",
  "Nice try! Keep it up! 🌟",
  "Well done! 💧",
  "Fantastic! 🌱",
  "Brilliant! ⭐",
];

interface PracticePageProps {
  child: ChildProfile;
  module: MapModule;
  target: SpeechTarget;
  isDemoMode: boolean;
  onComplete: (session: PracticeSession) => void;
  onExit: () => void;
  onViewGuide?: () => void;
}

type PracticePhase = "intro" | "listening" | "rep-complete" | "done";

export function PracticePage({
  child,
  module,
  target,
  isDemoMode,
  onComplete,
  onExit,
  onViewGuide,
}: PracticePageProps) {
  const isVisual = target.feedbackMode !== "audio_only";
  const useWebcam = isVisual && !isDemoMode;
  const useDemoCV = isVisual && isDemoMode;

  const [phase, setPhase] = useState<PracticePhase>("intro");
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [attemptNum, setAttemptNum] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [holdProgress, setHoldProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [plantStage, setPlantStage] = useState<PlantStage>(0);
  const [repFlash, setRepFlash] = useState(false);

  // Refs for stable values inside RAF + setTimeout callbacks
  const phaseRef = useRef<PracticePhase>("intro");
  const attemptNumRef = useRef(1);
  const attemptsRef = useRef<PracticeAttempt[]>([]);
  const repCompleteRef = useRef(false);
  const holdStartRef = useRef<number | null>(null);
  const recentRoundnessRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const sessionStartRef = useRef(Date.now());
  const currentWordRef = useRef<string>(module.words[0]);

  // Keep refs in sync
  phaseRef.current = phase;
  attemptNumRef.current = attemptNum;
  attemptsRef.current = attempts;
  currentWordRef.current = module.words[(attemptNum - 1) % module.words.length];

  const currentWord = currentWordRef.current;
  const completedCount = attempts.filter((a) => a.completed).length;

  // Webcam + visual simulation
  const { videoRef, canvasRef, metrics, status: camStatus, permissionDenied } =
    useFaceLandmarks(useWebcam && phase === "listening");
  const { demoState } = useDemoMode(useDemoCV && phase === "listening");

  // Audio analysis — audio-only targets (real + demo simulation)
  const { audioState, resetAttempt } = useAudioAnalysis(
    !isVisual && phase === "listening",
    isDemoMode
  );

  const finishSession = useCallback(
    (finalAttempts: PracticeAttempt[]) => {
      const session: PracticeSession = {
        id: crypto.randomUUID(),
        childId: child.id,
        moduleId: module.id,
        targetId: target.id,
        targetLabel: target.label,
        targetIpa: target.ipa,
        startedAt: new Date(sessionStartRef.current).toISOString(),
        completedAt: new Date().toISOString(),
        attempts: finalAttempts,
        wordsAttempted: finalAttempts.map((a) => a.targetWord),
        rewardsEarned: finalAttempts.filter((a) => a.completed).length,
        plantStage: 4,
      };
      phaseRef.current = "done";
      setPhase("done");
      onComplete(session);
    },
    [child, module, target, onComplete]
  );

  const advanceAttempt = useCallback(
    (newAttempts: PracticeAttempt[]) => {
      repCompleteRef.current = false;
      holdStartRef.current = null;
      recentRoundnessRef.current = [];
      setScore(0);
      setHoldProgress(0);
      resetAttempt();

      if (newAttempts.length >= TOTAL_ATTEMPTS) {
        finishSession(newAttempts);
      } else {
        const next = newAttempts.length + 1;
        attemptNumRef.current = next;
        setAttemptNum(next);
        phaseRef.current = "listening";
        setPhase("listening");
      }
    },
    [resetAttempt, finishSession]
  );

  const completeRep = useCallback(
    (repScore: number, holdMs: number, stability: number, symmetry: number) => {
      if (repCompleteRef.current) return;
      repCompleteRef.current = true;

      const attempt: PracticeAttempt = {
        id: crypto.randomUUID(),
        attemptNumber: attemptNumRef.current,
        targetLabel: target.label,
        targetWord: currentWordRef.current,
        audioAttemptDetected: true,
        visualScore: repScore,
        holdDurationMs: holdMs,
        stabilityScore: stability,
        symmetryScore: symmetry,
        completed: true,
        feedback: "Visual movement target achieved.",
      };

      const newAttempts = [...attemptsRef.current, attempt];
      attemptsRef.current = newAttempts;
      setAttempts(newAttempts);
      setPhase("rep-complete");
      phaseRef.current = "rep-complete";
      setRepFlash(true);
      setFeedbackMsg("Nice hold! You watered your plant! 💧");
      setHoldProgress(0);
      holdStartRef.current = null;
      const np = Math.min(
        4,
        Math.floor((newAttempts.filter((a) => a.completed).length / TOTAL_ATTEMPTS) * 5)
      ) as PlantStage;
      setPlantStage(np);
      setTimeout(() => setRepFlash(false), 900);
      setTimeout(() => advanceAttempt(newAttempts), 1900);
    },
    [target, advanceAttempt]
  );

  const completeAudioRep = useCallback(() => {
    if (repCompleteRef.current) return;
    repCompleteRef.current = true;
    const n = attemptNumRef.current;
    const fb = AUDIO_FEEDBACK[(n - 1) % AUDIO_FEEDBACK.length];

    const attempt: PracticeAttempt = {
      id: crypto.randomUUID(),
      attemptNumber: n,
      targetLabel: target.label,
      targetWord: currentWordRef.current,
      audioAttemptDetected: true,
      completed: true,
      feedback: fb,
    };

    const newAttempts = [...attemptsRef.current, attempt];
    attemptsRef.current = newAttempts;
    setAttempts(newAttempts);
    setPhase("rep-complete");
    phaseRef.current = "rep-complete";
    setRepFlash(true);
    setFeedbackMsg(fb);
    const np = Math.min(
      4,
      Math.floor((newAttempts.filter((a) => a.completed).length / TOTAL_ATTEMPTS) * 5)
    ) as PlantStage;
    setPlantStage(np);
    setTimeout(() => setRepFlash(false), 900);
    setTimeout(() => advanceAttempt(newAttempts), 1700);
  }, [target, advanceAttempt]);

  // RAF loop for visual scoring
  useEffect(() => {
    if (!isVisual || phase !== "listening") return;

    function tick() {
      if (phaseRef.current !== "listening" || repCompleteRef.current) return;
      const activeMetrics = useDemoCV ? demoState.metrics : metrics;
      recentRoundnessRef.current = [
        ...recentRoundnessRef.current.slice(-8),
        activeMetrics.roundnessRatio,
      ];
      const result = computeLipRoundingScore(activeMetrics, recentRoundnessRef.current);

      setScore(result.total);
      setFeedbackMsg(result.feedback);

      if (result.isAboveThreshold) {
        if (holdStartRef.current === null) {
          holdStartRef.current = performance.now();
        } else {
          const elapsed = performance.now() - holdStartRef.current;
          setHoldProgress(Math.min(100, (elapsed / HOLD_DURATION_MS) * 100));
          if (elapsed >= HOLD_DURATION_MS) {
            completeRep(result.total, Math.round(elapsed), result.stabilityScore, result.symmetryScore);
            return;
          }
        }
      } else {
        holdStartRef.current = null;
        setHoldProgress(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisual, phase, metrics, demoState.metrics, useDemoCV, completeRep]);

  // Audio attempt detection
  useEffect(() => {
    if (isVisual || phase !== "listening") return;
    if (audioState.isAttemptDetected && !repCompleteRef.current) completeAudioRep();
  }, [isVisual, phase, audioState.isAttemptDetected, completeAudioRep]);

  function startListening() {
    repCompleteRef.current = false;
    holdStartRef.current = null;
    recentRoundnessRef.current = [];
    setScore(0);
    setHoldProgress(0);
    setFeedbackMsg(
      isVisual
        ? (target.visualCue ?? "Make the target mouth shape and hold it.")
        : `Say "${currentWord}" out loud!`
    );
    sessionStartRef.current = Date.now();
    phaseRef.current = "listening";
    setPhase("listening");
  }

  const displayScore = useDemoCV ? demoState.simulatedScore : score;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <motion.button
          onClick={onExit}
          className="text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors"
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        >
          ← Exit
        </motion.button>
        <div className="flex items-center gap-2">
          <span className="font-black text-orange-500 text-sm">{target.label} {target.ipa}</span>
          {isDemoMode && (
            <span className="bg-slate-800 text-white text-[10px] font-black rounded-full px-2 py-0.5">
              DEMO
            </span>
          )}
        </div>
        {onViewGuide ? (
          <motion.button
            onClick={onViewGuide}
            className="text-xs font-bold text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-full px-2.5 py-1 transition-colors"
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            👁 Guide
          </motion.button>
        ) : (
          <div className="w-14" />
        )}
      </div>

      <div className="flex-1 flex flex-col items-center px-5 gap-4 pb-8">
        {/* Plant + water drops */}
        <div
          className={`bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-100/50 p-5 w-full max-w-sm flex flex-col items-center gap-3 transition-all duration-300 ${
            repFlash ? "ring-4 ring-green-400 ring-offset-2 shadow-green-200" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={plantStage}
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <PlantIllustration stage={plantStage} size={84} />
            </motion.div>
          </AnimatePresence>
          <WaterDrops total={TOTAL_ATTEMPTS} filled={completedCount} />
        </div>

        {/* Word — primary practice element, no card frame */}
        <div className="w-full max-w-sm text-center px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentWord}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.17, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-black text-slate-800 tracking-tight"
            >
              {currentWord}
            </motion.p>
          </AnimatePresence>

          {/* Contextual cue below word */}
          <AnimatePresence mode="wait">
            {isVisual && target.visualCue && phase === "listening" && (
              <motion.p
                key="visual-cue"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-sm font-semibold text-slate-400 mt-2"
              >
                {target.visualCue}
              </motion.p>
            )}
            {!isVisual && phase === "listening" && (
              <motion.p
                key="audio-cue"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-sm font-bold text-orange-400 mt-2"
              >
                say it out loud 🎤
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Webcam / visual tracking area */}
        {isVisual && (
          <div className="bg-white rounded-3xl shadow-md shadow-orange-100/50 p-3 w-full max-w-sm border border-orange-100">
            <div
              className="relative rounded-2xl overflow-hidden bg-slate-100"
              style={{ aspectRatio: "4/3" }}
            >
              {useWebcam ? (
                <>
                  <video
                    ref={videoRef as React.RefObject<HTMLVideoElement>}
                    className="w-full h-full object-cover scale-x-[-1]"
                    playsInline
                    muted
                    autoPlay
                  />
                  <canvas
                    ref={canvasRef as React.RefObject<HTMLCanvasElement>}
                    className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
                  />
                  {camStatus === "loading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
                      <p className="text-slate-500 font-semibold text-sm">Starting camera… 📷</p>
                    </div>
                  )}
                  {camStatus === "no-face" && phase === "listening" && (
                    <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 rounded-xl px-3 py-1.5 text-white text-xs font-bold text-center">
                      Move your face into the frame 👀
                    </div>
                  )}
                  {(camStatus === "error" || permissionDenied) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 gap-2 p-4 text-center">
                      <span className="text-3xl">📷</span>
                      <p className="text-slate-600 font-semibold text-sm">Camera unavailable</p>
                      <p className="text-slate-400 text-xs">Use Demo Mode for a reliable pitch</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 gap-2">
                  <motion.div
                    className="text-5xl"
                    animate={{ rotate: [0, -4, 4, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🤩
                  </motion.div>
                  <p className="text-xs text-slate-500 font-semibold">Simulated face tracking</p>
                </div>
              )}
              {phase === "listening" && holdProgress > 0 && (
                <div className="absolute top-2 right-2">
                  <ScoreRing
                    score={Math.round(holdProgress)}
                    size={52}
                    strokeWidth={6}
                    label="hold"
                  />
                </div>
              )}
            </div>

            {phase === "listening" && (
              <div className="flex items-center gap-3 mt-3">
                <ScoreRing score={displayScore} size={64} strokeWidth={7} label="shape" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 leading-snug">
                    {feedbackMsg}
                  </p>
                  {target.visibility === "partial" && (
                    <p className="text-[11px] text-amber-600 font-semibold mt-1">
                      👁 Partial visual feedback
                    </p>
                  )}
                  {isDemoMode && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Demo — score will auto-complete ✨
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio panel — audio-only targets */}
        {!isVisual && phase === "listening" && (
          <AudioAttemptPanel
            audioState={audioState}
            currentWord={currentWord}
            isDemoMode={isDemoMode}
            phase={phase}
          />
        )}

        {/* Rep-complete feedback */}
        <AnimatePresence>
          {phase === "rep-complete" && feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="w-full max-w-sm"
            >
              <FeedbackBubble message={feedbackMsg} variant="success" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start button */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm"
            >
              <motion.button
                onClick={startListening}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-full py-5 shadow-xl shadow-orange-200"
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 520, damping: 32 }}
              >
                {isVisual ? "Begin — show me! 👄" : "Begin — say it! 🎤"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
