import { useState } from "react";
import { PlantIllustration } from "../components/PlantIllustration";
import type { DifficultyRating, PracticeSession } from "../types";

interface SessionCompletePageProps {
  session: PracticeSession;
  onUpdateSession: (updated: PracticeSession) => void;
  onViewDashboard: () => void;
  onPracticeAgain: () => void;
}

const DIFFICULTY_OPTIONS: { value: DifficultyRating; label: string; emoji: string; color: string }[] = [
  { value: "easy", label: "Easy", emoji: "😊", color: "bg-green-50 border-green-300 text-green-700" },
  { value: "okay", label: "Okay", emoji: "🙂", color: "bg-amber-50 border-amber-300 text-amber-700" },
  { value: "hard", label: "Hard", emoji: "😅", color: "bg-rose-50 border-rose-300 text-rose-600" },
];

export function SessionCompletePage({ session, onUpdateSession, onViewDashboard, onPracticeAgain }: SessionCompletePageProps) {
  const [rating, setRating] = useState<DifficultyRating | null>(session.parentDifficultyRating ?? null);
  const [note, setNote] = useState(session.parentNote ?? "");
  const [saved, setSaved] = useState(false);

  const completedCount = session.attempts.filter((a) => a.completed).length;
  const avgScore = (() => {
    const visual = session.attempts.filter((a) => a.visualScore != null).map((a) => a.visualScore!);
    return visual.length > 0 ? Math.round(visual.reduce((a, b) => a + b, 0) / visual.length) : null;
  })();
  const avgHold = (() => {
    const holds = session.attempts.filter((a) => a.holdDurationMs != null).map((a) => a.holdDurationMs!);
    return holds.length > 0 ? (holds.reduce((a, b) => a + b, 0) / holds.length / 1000).toFixed(1) : null;
  })();

  function saveParentInfo() {
    const updated: PracticeSession = {
      ...session,
      parentDifficultyRating: rating ?? undefined,
      parentNote: note.trim() || undefined,
    };
    onUpdateSession(updated);
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Hero celebration */}
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 p-6 text-center border border-orange-100">
          <PlantIllustration stage={4} size={110} animate />
          <h2 className="text-3xl font-black text-slate-800 mt-3 mb-1">Practice complete! 🎉</h2>
          <p className="text-slate-500 font-semibold text-sm">
            Amazing work, {session.targetLabel} {session.targetIpa} practice done!
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-orange-50 rounded-2xl py-3 px-2">
              <p className="text-2xl font-black text-orange-600">{completedCount}</p>
              <p className="text-xs font-bold text-orange-500">attempts</p>
            </div>
            {avgScore != null ? (
              <div className="bg-blue-50 rounded-2xl py-3 px-2">
                <p className="text-2xl font-black text-blue-600">{avgScore}</p>
                <p className="text-xs font-bold text-blue-500">avg score</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl py-3 px-2">
                <p className="text-2xl font-black text-green-600">✓</p>
                <p className="text-xs font-bold text-green-500">done</p>
              </div>
            )}
            {avgHold != null ? (
              <div className="bg-purple-50 rounded-2xl py-3 px-2">
                <p className="text-2xl font-black text-purple-600">{avgHold}s</p>
                <p className="text-xs font-bold text-purple-500">avg hold</p>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl py-3 px-2">
                <p className="text-2xl font-black text-amber-600">🌟</p>
                <p className="text-xs font-bold text-amber-500">star!</p>
              </div>
            )}
          </div>
        </div>

        {/* Parent section */}
        <div className="bg-white rounded-3xl shadow-md p-5 border border-slate-100">
          <h3 className="font-black text-slate-700 mb-1 text-sm uppercase tracking-wide">Parent / Carer check-in</h3>
          <p className="text-xs text-slate-500 mb-3">How did practice go today?</p>

          {/* Difficulty rating */}
          <div className="flex gap-2 mb-3">
            {DIFFICULTY_OPTIONS.map(({ value, label, emoji, color }) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`flex-1 rounded-2xl py-2.5 border-2 font-bold text-sm transition-all duration-150 ${
                  rating === value ? color + " scale-105 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <div className="text-lg">{emoji}</div>
                <div className="text-xs">{label}</div>
              </button>
            ))}
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note for the clinician (e.g. practice was easier after dinner)…"
            rows={2}
            maxLength={200}
            className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-400 outline-none px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 resize-none transition-colors"
          />

          {!saved ? (
            <button
              onClick={saveParentInfo}
              className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-full py-2.5 transition-all active:scale-95"
            >
              Save parent note
            </button>
          ) : (
            <p className="mt-3 text-center text-green-600 font-bold text-sm">✓ Saved!</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onViewDashboard}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            View Progress 📊
          </button>
          <button
            onClick={onPracticeAgain}
            className="w-full bg-white border-2 border-slate-200 hover:border-orange-300 text-slate-600 font-bold text-base rounded-full py-3.5 transition-all active:scale-95"
          >
            Practice Again 🔄
          </button>
        </div>
      </div>
    </div>
  );
}
