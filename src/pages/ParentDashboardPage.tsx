import { useMemo } from "react";
import { ProgressChart } from "../components/ProgressChart";
import { PlantIllustration } from "../components/PlantIllustration";
import type { ChildProfile, PracticeSession } from "../types";

interface ParentDashboardPageProps {
  child: ChildProfile;
  sessions: PracticeSession[];
  onClinicianSummary: () => void;
  onPractice: () => void;
  onBack: () => void;
  onClearData: () => void;
}

export function ParentDashboardPage({ child, sessions, onClinicianSummary, onPractice, onBack, onClearData }: ParentDashboardPageProps) {
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalAttempts = sessions.reduce((s, sess) => s + sess.attempts.length, 0);
    const completedAttempts = sessions.reduce((s, sess) => s + sess.attempts.filter((a) => a.completed).length, 0);
    const completionRate = totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0;

    // Streak: consecutive days with practice
    const dates = sessions
      .map((s) => new Date(s.startedAt).toDateString())
      .filter((d, i, arr) => arr.indexOf(d) === i)
      .sort();
    let streak = 0;
    if (dates.length > 0) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (dates[dates.length - 1] === today || dates[dates.length - 1] === yesterday) {
        streak = 1;
        for (let i = dates.length - 2; i >= 0; i--) {
          const diff = new Date(dates[i + 1]).getTime() - new Date(dates[i]).getTime();
          if (diff <= 86400000 * 1.5) streak++;
          else break;
        }
      }
    }

    // Target history
    const targetCounts: Record<string, { label: string; ipa: string; count: number; completionRate: number }> = {};
    for (const sess of sessions) {
      if (!targetCounts[sess.targetId]) {
        targetCounts[sess.targetId] = { label: sess.targetLabel, ipa: sess.targetIpa, count: 0, completionRate: 0 };
      }
      targetCounts[sess.targetId].count++;
      const completed = sess.attempts.filter((a) => a.completed).length;
      const total = sess.attempts.length;
      targetCounts[sess.targetId].completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    const lastRating = lastSession?.parentDifficultyRating;

    return { totalSessions, totalAttempts, completionRate, streak, targetCounts, lastSession, lastRating };
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <button onClick={onBack} className="self-start text-slate-500 font-semibold text-sm hover:text-slate-700">← Back</button>
          <PlantIllustration stage={0} size={100} />
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-700">No practice yet</h2>
            <p className="text-slate-500 text-sm mt-2">Complete your first session to see {child.nickname}'s progress here.</p>
          </div>
          <button
            onClick={onPractice}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200 active:scale-95 transition-all"
          >
            Start First Practice 🌱
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-slate-500 text-sm font-semibold hover:text-slate-700">← Back</button>
          <h2 className="text-xl font-black text-slate-800">{child.nickname}'s Progress</h2>
          <div className="w-12" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Sessions", value: stats.totalSessions, emoji: "📅", color: "bg-orange-50 text-orange-600" },
            { label: "Attempts", value: stats.totalAttempts, emoji: "🎤", color: "bg-blue-50 text-blue-600" },
            { label: "Completion", value: `${stats.completionRate}%`, emoji: "✅", color: "bg-green-50 text-green-600" },
            { label: "Day streak", value: stats.streak, emoji: "🔥", color: "bg-amber-50 text-amber-600" },
          ].map(({ label, value, emoji, color }) => (
            <div key={label} className={`${color.split(" ")[0]} rounded-2xl p-4 border border-white shadow-sm`}>
              <div className="text-xl mb-1">{emoji}</div>
              <p className={`text-2xl font-black ${color.split(" ")[1]}`}>{value}</p>
              <p className={`text-xs font-bold ${color.split(" ")[1]} opacity-70`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Progress chart */}
        <div className="bg-white rounded-3xl shadow-md p-4 border border-slate-100">
          <h3 className="font-black text-slate-700 text-sm mb-3">Completion rate over time</h3>
          <ProgressChart sessions={sessions} />
          <p className="text-xs text-slate-400 text-center mt-2">Orange = completion rate · Blue = avg visual score (if applicable)</p>
        </div>

        {/* Target history */}
        <div className="bg-white rounded-3xl shadow-md p-4 border border-slate-100">
          <h3 className="font-black text-slate-700 text-sm mb-3">Target practice history</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(stats.targetCounts).map(([id, { label, ipa, count, completionRate }]) => (
              <div key={id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-3 py-2">
                <div>
                  <span className="font-black text-slate-800 text-sm">{label} {ipa}</span>
                  <span className="text-xs text-slate-500 ml-2">{count} session{count !== 1 ? "s" : ""}</span>
                </div>
                <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${completionRate >= 80 ? "bg-green-100 text-green-700" : completionRate >= 50 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                  {completionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent parent notes */}
        {stats.lastSession?.parentNote && (
          <div className="bg-white rounded-3xl shadow-md p-4 border border-slate-100">
            <h3 className="font-black text-slate-700 text-sm mb-2">Recent parent note</h3>
            <p className="text-sm text-slate-600 italic">"{stats.lastSession.parentNote}"</p>
            {stats.lastRating && (
              <span className="inline-flex mt-1.5 items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                Difficulty: {stats.lastRating}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onClinicianSummary}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-base rounded-full py-4 shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            📋 Clinician Summary
          </button>
          <button
            onClick={onPractice}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-base rounded-full py-4 shadow-lg shadow-orange-200 active:scale-95 transition-all"
          >
            Start Practice 🌱
          </button>
          <button
            onClick={() => {
              if (window.confirm("Clear all practice data? This cannot be undone.")) {
                onClearData();
              }
            }}
            className="w-full text-slate-400 text-xs font-medium py-2 hover:text-rose-500 transition-colors"
          >
            Clear practice data
          </button>
        </div>
      </div>
    </div>
  );
}
