import React, { useMemo } from "react";
import { TherapistSummaryCard } from "../components/TherapistSummaryCard";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { generateTherapistSummary } from "../lib/summaries";
import type { ExerciseSession } from "../types/exercise";

interface Props {
  sessions: ExerciseSession[];
  onBack: () => void;
}

export function TherapistSummaryPage({ sessions, onBack }: Props) {
  const summaryText = useMemo(
    () => generateTherapistSummary(sessions),
    [sessions]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-sm">
          ← Back
        </button>
        <div>
          <h1 className="font-bold text-slate-900">Therapist Summary</h1>
          <p className="text-xs text-slate-400">Share this with your speech pathologist</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
          <p className="font-medium mb-1">📋 How to use this summary</p>
          <p>
            Copy this summary and share it with your speech pathologist via email or
            messaging. It describes your visible practice behaviour — not a clinical
            assessment.
          </p>
        </div>

        <TherapistSummaryCard summaryText={summaryText} />

        <DisclaimerBanner />
      </main>
    </div>
  );
}
