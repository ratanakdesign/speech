import { useState } from "react";
import { motion } from "framer-motion";
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

  const completedCount = session.attempts.filter((a) => a.completed).length;
  const avgScore = (() => {
    const vis = session.attempts.filter((a) => a.visualScore != null).map((a) => a.visualScore!);
    return vis.length > 0 ? Math.round(vis.reduce((a, b) => a + b, 0) / vis.length) : null;
  })();
  const avgHold = (() => {
    const holds = session.attempts.filter((a) => a.holdDurationMs != null).map((a) => a.holdDurationMs!);
    return holds.length > 0 ? (holds.reduce((a, b) => a + b, 0) / holds.length / 1000).toFixed(1) : null;
  })();

  const stats = [
    { value: completedCount, label: "attempts", color: "bg-orange-50 text-orange-600" },
    avgScore != null
      ? { value: avgScore, label: "avg score", color: "bg-blue-50 text-blue-600" }
      : { value: "✓", label: "done", color: "bg-green-50 text-green-600" },
    avgHold != null
      ? { value: `${avgHold}s`, label: "avg hold", color: "bg-purple-50 text-purple-600" }
      : { value: "🌟", label: "star!", color: "bg-amber-50 text-amber-600" },
  ];

  function saveParentInfo() {
    onUpdateSession({
      ...session,
      parentDifficultyRating: rating ?? undefined,
      parentNote: note.trim() || undefined,
    });
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Hero */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl shadow-orange-100/60 p-6 text-center border border-orange-100"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
            className="flex justify-center mb-3"
          >
            <PlantIllustration stage={4} size={110} animate />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
              Well done! 🎉
            </h2>
            <p className="text-slate-500 font-semibold text-sm">
              {session.targetLabel} {session.targetIpa} practice complete
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            className="grid grid-cols-3 gap-3 mt-5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
              hidden: {},
            }}
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                className={`${s.color.split(" ")[0]} rounded-2xl py-3 px-2`}
                variants={{
                  hidden: { opacity: 0, scale: 0.72 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { type: "spring", stiffness: 380, damping: 22 },
                  },
                }}
              >
                <p className={`text-2xl font-black ${s.color.split(" ")[1]}`}>{s.value}</p>
                <p className={`text-xs font-bold ${s.color.split(" ")[1]} opacity-70`}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Parent check-in */}
        <motion.div
          className="bg-white rounded-3xl shadow-md shadow-orange-100/40 p-5 border border-orange-100"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3, ease: "easeOut" }}
        >
          <p className="font-black text-slate-700 text-sm uppercase tracking-wide mb-0.5">
            Parent check-in
          </p>
          <p className="text-xs font-semibold text-slate-400 mb-4">How did practice go today?</p>

          <div className="flex gap-2 mb-4">
            {DIFFICULTY_OPTIONS.map(({ value, label, emoji, active }) => (
              <motion.button
                key={value}
                onClick={() => setRating(value)}
                className={`flex-1 rounded-2xl py-2.5 border-2 font-bold text-sm transition-colors ${
                  rating === value
                    ? active
                    : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                }`}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              >
                <div className="text-lg mb-0.5">{emoji}</div>
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
              className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-full py-2.5"
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            >
              Save parent note
            </motion.button>
          ) : (
            <p className="mt-3 text-center text-green-600 font-bold text-sm">✓ Saved!</p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3, ease: "easeOut" }}
        >
          <motion.button
            onClick={onViewDashboard}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            View Progress 📊
          </motion.button>
          <motion.button
            onClick={onPracticeAgain}
            className="w-full bg-white border-2 border-slate-200 hover:border-orange-200 text-slate-600 font-bold text-base rounded-full py-3.5"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            Back to Map 🗺️
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
