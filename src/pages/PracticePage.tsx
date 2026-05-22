import { useCallback, useEffect, useRef, useState } from "react";
import { PlantIllustration } from "../components/PlantIllustration";
import { WaterDrops } from "../components/WaterDrops";
import { ScoreRing } from "../components/ScoreRing";
import { FeedbackBubble } from "../components/FeedbackBubble";
import { useFaceLandmarks } from "../hooks/useFaceLandmarks";
import { useAudioDetection } from "../hooks/useAudioDetection";
import { useDemoMode } from "../hooks/useDemoMode";
import { computeLipRoundingScore, HOLD_DURATION_MS } from "../lib/scoring";
import type { ChildProfile, PlantStage, PracticeAttempt, PracticeSession, SpeechTarget } from "../types";

const TOTAL_ATTEMPTS = 5;

const VISUAL_WORDS: Record<string, string[]> = {
  p: ["pop", "pea", "puppy"],
  m: ["moo", "mum", "moon"],
  oo: ["moo", "boo", "moon"],
  f: ["fish", "fun", "leaf"],
};
const AUDIO_ONLY_WORDS: Record<string, string[]> = {
  s: ["sun ☀️", "sock 🧦", "snake 🐍", "star ⭐", "soup 🥣"],
  k: ["key 🔑", "cake 🎂", "car 🚗", "cup ☕", "kite 🪁"],
};
const AUDIO_FEEDBACK = [
  "Great effort! 🎉",
  "Nice try! Keep it up! 🌟",
  "Well done! 💧",
  "Fantastic! 🌱",
  "Brilliant! ⭐",
];

interface PracticePageProps {
  child: ChildProfile;
  target: SpeechTarget;
  isDemoMode: boolean;
  onComplete: (session: PracticeSession) => void;
  onExit: () => void;
}

type PracticePhase = "intro" | "listening" | "rep-complete" | "done";

export function PracticePage({ child, target, isDemoMode, onComplete, onExit }: PracticePageProps) {
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

  // Refs for stable values inside callbacks
  const phaseRef = useRef<PracticePhase>("intro");
  const attemptNumRef = useRef(1);
  const attemptsRef = useRef<PracticeAttempt[]>([]);
  const repCompleteRef = useRef(false);
  const holdStartRef = useRef<number | null>(null);
  const recentRoundnessRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const sessionStartRef = useRef(Date.now());

  // Keep refs in sync
  phaseRef.current = phase;
  attemptNumRef.current = attemptNum;
  attemptsRef.current = attempts;

  // Hooks
  const { videoRef, canvasRef, metrics, status: camStatus, permissionDenied } = useFaceLandmarks(useWebcam && phase === "listening");
  const { audioState, resetAttempt } = useAudioDetection(!isDemoMode && !isVisual && phase === "listening");
  const { demoState, triggerDemoAttempt, resetAudio: resetDemoAudio } = useDemoMode(isDemoMode && phase === "listening");

  const wordList = isVisual
    ? (VISUAL_WORDS[target.id] ?? target.exampleWords)
    : (AUDIO_ONLY_WORDS[target.id] ?? target.exampleWords);
  const currentWord = wordList[(attemptNum - 1) % wordList.length];

  const finishSession = useCallback(
    (finalAttempts: PracticeAttempt[]) => {
      const session: PracticeSession = {
        id: crypto.randomUUID(),
        childId: child.id,
        targetId: target.id,
        targetLabel: target.label,
        targetIpa: target.ipa,
        startedAt: new Date(sessionStartRef.current).toISOString(),
        completedAt: new Date().toISOString(),
        attempts: finalAttempts,
        rewardsEarned: finalAttempts.filter((a) => a.completed).length,
        plantStage: 4,
      };
      phaseRef.current = "done";
      setPhase("done");
      onComplete(session);
    },
    [child, target, onComplete]
  );

  const advanceAttempt = useCallback(
    (newAttempts: PracticeAttempt[]) => {
      repCompleteRef.current = false;
      holdStartRef.current = null;
      recentRoundnessRef.current = [];
      setScore(0);
      setHoldProgress(0);
      resetAttempt();
      resetDemoAudio();

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
    [resetAttempt, resetDemoAudio, finishSession]
  );

  const completeRep = useCallback(
    (repScore: number, holdMs: number, stability: number, symmetry: number) => {
      if (repCompleteRef.current) return;
      repCompleteRef.current = true;

      const attempt: PracticeAttempt = {
        id: crypto.randomUUID(),
        attemptNumber: attemptNumRef.current,
        targetLabel: target.label,
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
      const np = Math.min(4, Math.floor((newAttempts.filter((a) => a.completed).length / TOTAL_ATTEMPTS) * 5)) as PlantStage;
      setPlantStage(np);
      setTimeout(() => setRepFlash(false), 800);
      setTimeout(() => advanceAttempt(newAttempts), 1800);
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
    const np = Math.min(4, Math.floor((newAttempts.filter((a) => a.completed).length / TOTAL_ATTEMPTS) * 5)) as PlantStage;
    setPlantStage(np);
    setTimeout(() => setRepFlash(false), 800);
    setTimeout(() => advanceAttempt(newAttempts), 1600);
  }, [target, advanceAttempt]);

  // RAF loop for visual scoring
  useEffect(() => {
    if (!isVisual || phase !== "listening") return;

    function tick() {
      if (phaseRef.current !== "listening" || repCompleteRef.current) return;

      const activeMetrics = useDemoCV ? demoState.metrics : metrics;
      recentRoundnessRef.current = [...recentRoundnessRef.current.slice(-8), activeMetrics.roundnessRatio];
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

  // Audio detection effect (non-visual targets)
  useEffect(() => {
    if (isVisual || phase !== "listening") return;
    const detected = isDemoMode ? demoState.audioAttemptDetected : audioState.attemptDetected;
    if (detected && !repCompleteRef.current) completeAudioRep();
  }, [isVisual, phase, isDemoMode, demoState.audioAttemptDetected, audioState.attemptDetected, completeAudioRep]);

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

  const audioVol = isDemoMode ? demoState.audioVolume : audioState.volume;
  const completedCount = attempts.filter((a) => a.completed).length;
  const displayScore = useDemoCV ? demoState.simulatedScore : score;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button onClick={onExit} className="text-slate-500 font-semibold text-sm hover:text-slate-700 transition-colors">
          ← Exit
        </button>
        <div className="flex items-center gap-2">
          <span className="font-black text-orange-600 text-sm">{target.label} {target.ipa}</span>
          {isDemoMode && (
            <span className="bg-slate-800 text-white text-xs font-bold rounded-full px-2 py-0.5">DEMO</span>
          )}
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 gap-3 pb-6">
        {/* Plant + progress */}
        <div
          className={`bg-white rounded-3xl shadow-lg shadow-orange-100 border border-orange-100 p-5 w-full max-w-sm flex flex-col items-center gap-2 transition-all duration-300 ${repFlash ? "ring-4 ring-green-400 ring-offset-2" : ""}`}
        >
          <PlantIllustration stage={plantStage} size={90} animate />
          <WaterDrops total={TOTAL_ATTEMPTS} filled={completedCount} />
          <p className="text-xs text-slate-500 font-semibold">{completedCount} / {TOTAL_ATTEMPTS} done</p>
        </div>

        {/* Current word */}
        <div className="bg-white rounded-3xl shadow-md shadow-orange-100 p-4 w-full max-w-sm text-center border border-orange-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
            Attempt {attemptNum} of {TOTAL_ATTEMPTS}
          </p>
          <p className="text-3xl font-black text-slate-800">{currentWord}</p>
          {isVisual && target.visualCue && (
            <p className="text-sm text-slate-500 font-medium mt-1">{target.visualCue}</p>
          )}
          {!isVisual && (
            <p className="text-sm text-orange-600 font-semibold mt-1">🎤 Say it out loud!</p>
          )}
        </div>

        {/* Webcam / visual area */}
        {isVisual && (
          <div className="bg-white rounded-3xl shadow-md shadow-orange-100 p-3 w-full max-w-sm border border-orange-100">
            <div className="relative rounded-2xl overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
              {useWebcam ? (
                <>
                  <video
                    ref={videoRef as React.RefObject<HTMLVideoElement>}
                    className="w-full h-full object-cover scale-x-[-1]"
                    playsInline muted autoPlay
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
                      <p className="text-slate-400 text-xs">Tip: use Demo Mode for a reliable pitch</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 gap-2">
                  <div className="text-5xl">🤩</div>
                  <p className="text-xs text-slate-500 font-semibold">Simulated face tracking</p>
                </div>
              )}
              {phase === "listening" && holdProgress > 0 && (
                <div className="absolute top-2 right-2">
                  <ScoreRing score={Math.round(holdProgress)} size={52} strokeWidth={6} label="hold" />
                </div>
              )}
            </div>
            {phase === "listening" && (
              <div className="flex items-center gap-3 mt-3">
                <ScoreRing score={displayScore} size={68} strokeWidth={8} label="score" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-600 leading-snug">{feedbackMsg}</p>
                  {target.visibility === "partial" && (
                    <p className="text-xs text-amber-600 font-medium mt-1">👁 Partial visual feedback</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio level bar (audio-only) */}
        {!isVisual && phase === "listening" && (
          <div className="bg-white rounded-3xl shadow-md p-4 w-full max-w-sm border border-orange-100">
            <div className="flex items-center gap-3">
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${audioVol > 20 ? "bg-green-100" : "bg-slate-100"}`}>
                🎤
                {audioVol > 20 && <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />}
              </div>
              <div className="flex-1">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-100"
                    style={{ width: `${Math.min(100, audioVol * 1.4)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {audioVol > 20 ? "Hearing you! 🎶" : "Say the word loudly…"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback on rep complete */}
        {phase === "rep-complete" && feedbackMsg && (
          <div className="w-full max-w-sm">
            <FeedbackBubble message={feedbackMsg} variant="success" />
          </div>
        )}

        {/* Start button */}
        {phase === "intro" && (
          <button
            onClick={startListening}
            className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-full py-5 shadow-lg shadow-orange-200 transition-all duration-150 active:scale-95"
          >
            {isVisual ? "Begin — show me! 👄" : "Begin — say it! 🎤"}
          </button>
        )}

        {/* Demo mode: simulate audio attempt */}
        {isDemoMode && !isVisual && phase === "listening" && (
          <button
            onClick={triggerDemoAttempt}
            className="w-full max-w-sm bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-full py-4 shadow-md transition-all active:scale-95"
          >
            Simulate Attempt (Demo) 🎭
          </button>
        )}

        {isDemoMode && isVisual && phase === "listening" && (
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Demo mode: watch the simulated score — score will automatically complete a rep.
          </p>
        )}
      </div>
    </div>
  );
}
