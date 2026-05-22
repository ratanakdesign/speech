import React from "react";
import { MetricCard } from "../components/MetricCard";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import type { ExerciseSession } from "../types/exercise";

interface Props {
  session: ExerciseSession;
  onDashboard: () => void;
  onRepeat: () => void;
}

export function ResultsPage({ session, onDashboard, onRepeat }: Props) {
  const improvement =
    session.reps.length >= 2
      ? session.reps[session.reps.length - 1].score - session.reps[0].score
      : null;

  const improvementLabel =
    improvement === null
      ? null
      : improvement > 0
      ? `+${improvement} from first rep`
      : improvement < 0
      ? `${improvement} from first rep`
      : "Consistent across reps";

  const improvementTrend =
    improvement === null ? undefined : improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👄</span>
          <span className="font-bold text-slate-900">MouthMetrics</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎉</span>
            <h1 className="text-2xl font-bold text-slate-900">Session Complete!</h1>
            {session.isDemoData && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">
                Demo data
              </span>
            )}
          </div>
          <p className="text-slate-500">{session.exerciseName}</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Best score" value={session.bestScore} highlight />
          <MetricCard label="Average" value={session.averageScore} />
          <MetricCard label="Stability" value={session.averageStability} />
          <MetricCard label="Symmetry" value={session.averageSymmetry} />
        </div>

        {/* Improvement */}
        {improvementLabel && (
          <MetricCard
            label="Improvement"
            value={improvementLabel}
            trend={improvementTrend}
          />
        )}

        {/* Rep breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Rep breakdown</h2>
          <div className="space-y-3">
            {session.reps.map((rep) => (
              <div key={rep.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {rep.repNumber}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${rep.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 tabular-nums w-8 text-right">
                  {rep.score}
                </span>
                <span className="text-xs text-slate-400 w-14 text-right">
                  {(rep.holdDurationMs / 1000).toFixed(1)}s hold
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary text */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <p className="text-sm font-medium text-indigo-700 mb-1">Session summary</p>
          <p className="text-slate-700 text-sm leading-relaxed">{session.summary}</p>
        </div>

        <DisclaimerBanner compact />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDashboard}
            className="flex-1 py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            View Progress Dashboard
          </button>
          <button
            onClick={onRepeat}
            className="flex-1 py-3.5 bg-white text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 border border-slate-200 transition-colors"
          >
            Practise Again
          </button>
        </div>
      </main>
    </div>
  );
}
