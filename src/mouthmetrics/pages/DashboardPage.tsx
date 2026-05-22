import React, { useMemo } from "react";
import { MetricCard } from "../components/MetricCard";
import { ProgressChart } from "../components/ProgressChart";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import type { ExerciseSession } from "../types/exercise";

interface Props {
  sessions: ExerciseSession[];
  onStartPractice: () => void;
  onTherapistSummary: () => void;
  onClearData: () => void;
  onBack: () => void;
}

export function DashboardPage({
  sessions,
  onStartPractice,
  onTherapistSummary,
  onClearData,
  onBack,
}: Props) {
  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return { totalSessions: 0, totalReps: 0, bestScore: 0, avgScore: 0, mostImprovedExercise: "—" };
    }

    const totalReps = sessions.reduce((s, sess) => s + sess.reps.length, 0);
    const bestScore = Math.max(...sessions.map((s) => s.bestScore));
    const avgScore = Math.round(
      sessions.reduce((s, sess) => s + sess.averageScore, 0) / sessions.length
    );

    // Most improved: exercise with greatest score difference between first and last session
    const byType: Record<string, number[]> = {};
    for (const s of sessions) {
      if (!byType[s.exerciseName]) byType[s.exerciseName] = [];
      byType[s.exerciseName].push(s.averageScore);
    }
    let mostImprovedExercise = "—";
    let maxImprovement = 0;
    for (const [name, scores] of Object.entries(byType)) {
      if (scores.length >= 2) {
        const imp = scores[scores.length - 1] - scores[0];
        if (imp > maxImprovement) {
          maxImprovement = imp;
          mostImprovedExercise = name;
        }
      }
    }

    return { totalSessions: sessions.length, totalReps, bestScore, avgScore, mostImprovedExercise };
  }, [sessions]);

  const recentSessions = [...sessions].reverse().slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-sm">
            ← Back
          </button>
          <div>
            <h1 className="font-bold text-slate-900">Progress Dashboard</h1>
            <p className="text-xs text-slate-400">Your practice history</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onTherapistSummary}
            className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-indigo-100 font-medium"
          >
            Therapist report
          </button>
          <button
            onClick={onStartPractice}
            className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 font-medium"
          >
            + Practice
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No sessions yet</h2>
            <p className="text-slate-400 mb-6">
              Complete your first exercise to see progress over time.
            </p>
            <button
              onClick={onStartPractice}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700"
            >
              Start First Exercise
            </button>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label="Sessions"
                value={stats.totalSessions}
                highlight
              />
              <MetricCard label="Total reps" value={stats.totalReps} />
              <MetricCard label="Best score" value={stats.bestScore} />
              <MetricCard label="Avg score" value={stats.avgScore} />
            </div>

            {stats.mostImprovedExercise !== "—" && (
              <MetricCard
                label="Most improved"
                value={stats.mostImprovedExercise}
                subLabel="Based on score trend"
              />
            )}

            {/* Progress chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-1">Score over time</h2>
              <p className="text-xs text-slate-400 mb-4">Average score per session</p>
              <ProgressChart sessions={sessions} />
            </div>

            {/* Recent sessions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Recent sessions</h2>
              <div className="space-y-3">
                {recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-700">
                        {s.averageScore}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.exerciseName}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {s.reps.length} reps
                          {s.isDemoData && (
                            <span className="ml-1 text-amber-500">(demo)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400">Best</p>
                        <p className="text-sm font-semibold text-slate-700">{s.bestScore}</p>
                      </div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 rounded-full"
                          style={{ width: `${s.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DisclaimerBanner compact />

            {/* Clear data */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (window.confirm("Clear all practice data? This cannot be undone.")) {
                    onClearData();
                  }
                }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all data
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
