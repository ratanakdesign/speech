import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlantIllustration } from "../components/PlantIllustration";
import type { DifficultyRating, PracticeSession } from "../types";

interface SessionCompletePageProps {
  session: PracticeSession;
  onUpdateSession: (updated: PracticeSession) => void;
  onViewDashboard: () => void;
  onPracticeAgain: () => void;
}

const DIFFICULTY_OPTIONS: {
  value: DifficultyRating;
  label: string;
  emoji: string;
  active: string;
}[] = [
  { value: "easy", label: "Easy", emoji: "😊", active: "bg-green-50 border-green-400 text-green-700" },
  { value: "okay", label: "Okay", emoji: "🙂", active: "bg-amber-50 border-amber-400 text-amber-700" },
  { value: "hard", label: "Hard", emoji: "😅", active: "bg-rose-50 border-rose-400 text-rose-600" },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 22 },
  },
};

export function SessionCompletePage({
  session,
  onUpdateSession,
  onViewDashboard,
  onPracticeAgain,
}: SessionCompletePageProps) {
  const [rating, setRating] = useState<DifficultyRating | null>(
    session.parentDifficultyRating ?? null
  );
  const [note, setNote] = useState(session.parentNote ?? "");
  const [saved, setSaved] = useState(false);
  const [showGrownUp, setShowGrownUp] = useState(false);

  const completedCount = session.attempts.filter((a) => a.completed).length;
  const starsEarned = completedCount >= 5 ? 3 : completedCount >= 3 ? 2 : completedCount >= 1 ? 1 : 0;

  const avgHold = (() => {
    const holds = session.attempts
      .filter((a) => a.holdDurationMs != null)
      .map((a) => a.holdDurationMs!);
    return holds.length > 0
      ? (holds.reduce((a, b) => a + b, 0) / holds.length / 1000).toFixed(1)
      : null;
  })();

  function saveParentInfo() {
    onUpdateSession({
      ...session,
      parentDifficultyRating: rating ?? undefined,
      parentNote: note.trim() || undefined,
    });
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Child celebration — hero */}
      <div className="flex-1 flex flex-col items-center px-5 pt-10 pb-6">
        {/* Plant */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
          className="mb-2"
        >
          <PlantIllustration stage={4} size={130} animate />
        </motion.div>

        {/* Headline */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Your plant grew! 🌱
          </h2>
          <p className="text-slate-500 font-semibold text-base mt-1">
            Amazing practice, {session.targetLabel}!
          </p>
        </motion.div>

        {/* Stars earned */}
        <motion.div
          className="flex gap-3 mb-6"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {[1, 2, 3].map((n) => (
            <motion.span
              key={n}
              className="text-4xl"
              variants={popIn}
              style={{ filter: n <= starsEarned ? "none" : "grayscale(1)", opacity: n <= starsEarned ? 1 : 0.22 }}
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        {/* Attempt count — friendly, child-facing */}
        <motion.div
          className="bg-white rounded-3xl shadow-md shadow-orange-100/50 px-8 py-4 border border-orange-100 text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.28, ease: "easeOut" }}
        >
          <p className="text-4xl font-black text-orange-500">{completedCount}</p>
          <p className="text-sm font-bold text-slate-500 mt-0.5">
            {completedCount === 1 ? "great try" : "great tries"} today!
          </p>
          {avgHold && (
            <p className="text-xs font-semibold text-slate-400 mt-1">avg hold {avgHold}s</p>
          )}
        </motion.div>

        {/* Primary CTA — back to map */}
        <motion.button
          onClick={onPracticeAgain}
          className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-full py-5 shadow-xl shadow-orange-200 mb-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.96 }}
        >
          Back to Adventure Map 🗺️
        </motion.button>

        {/* Grown-up accordion trigger */}
        <motion.button
          onClick={() => setShowGrownUp(!showGrownUp)}
          className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          whileTap={{ scale: 0.96 }}
        >
          <span>👨‍👩‍👧 Grown-up summary</span>
          <span className="text-slate-400 text-xs">{showGrownUp ? "▲" : "▼"}</span>
        </motion.button>

        {/* Grown-up section — collapsible */}
        <AnimatePresence>
          {showGrownUp && (
            <motion.div
              className="w-full max-w-sm"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="bg-white rounded-3xl shadow-md shadow-orange-100/40 p-5 border border-orange-100 mt-3 flex flex-col gap-4">
                {/* Session meta */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Session summary
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-slate-500">Target</span>
                      <span className="text-xs font-black text-slate-700">
                        {session.targetLabel} {session.targetIpa}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-slate-500">Attempts detected</span>
                      <span className="text-xs font-black text-slate-700">{completedCount} / {session.attempts.length}</span>
                    </div>
                    {session.wordsAttempted && session.wordsAttempted.length > 0 && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-slate-500">Words practised</span>
                        <span className="text-xs font-bold text-slate-700 text-right max-w-[55%]">
                          {[...new Set(session.wordsAttempted)].join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parent check-in */}
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-1">How did practice feel?</p>
                  <div className="flex gap-2 mb-3">
                    {DIFFICULTY_OPTIONS.map(({ value, label, emoji, active }) => (
                      <motion.button
                        key={value}
                        onClick={() => setRating(value)}
                        className={`flex-1 rounded-2xl py-2 border-2 font-bold text-sm transition-colors ${
                          rating === value
                            ? active
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      >
                        <div className="text-base mb-0.5">{emoji}</div>
                        <div className="text-xs">{label}</div>
                      </motion.button>
                    ))}
                  </div>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note for the clinician (e.g. went well after dinner)…"
                    rows={2}
                    maxLength={200}
                    className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-300 outline-none px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 resize-none transition-colors"
                  />

                  {!saved ? (
                    <motion.button
                      onClick={saveParentInfo}
                      className="mt-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-full py-2.5"
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    >
                      Save parent note
                    </motion.button>
                  ) : (
                    <p className="mt-2 text-center text-green-600 font-bold text-sm">✓ Saved!</p>
                  )}
                </div>

                {/* View dashboard */}
                <button
                  onClick={onViewDashboard}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors text-center py-1"
                >
                  View full progress →
                </button>

                <p className="text-[9px] text-slate-300 text-center leading-relaxed">
                  Attempt detection tracks practice behaviour only · Not a clinical assessment ·
                  Always work with a speech-language pathologist
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
