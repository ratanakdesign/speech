import React from "react";
import { DisclaimerBanner } from "../components/DisclaimerBanner";

interface Props {
  onStart: () => void;
  onDashboard: () => void;
  sessionCount: number;
}

export function LandingPage({ onStart, onDashboard, sessionCount }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👄</span>
          <span className="font-bold text-slate-900 text-lg tracking-tight">MouthMetrics</span>
        </div>
        {sessionCount > 0 && (
          <button
            onClick={onDashboard}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Dashboard →
          </button>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-2xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Real-time computer vision
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
          Turn speech practice into{" "}
          <span className="text-indigo-600">measurable progress.</span>
        </h1>

        <p className="text-lg text-slate-500 mb-8 max-w-lg">
          MouthMetrics uses your webcam to track visible mouth movement during
          therapist-prescribed practice exercises.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={onStart}
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-lg shadow-indigo-200 text-lg"
          >
            Start Practice
          </button>
          {sessionCount > 0 && (
            <button
              onClick={onDashboard}
              className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 border border-slate-200 transition-colors text-lg"
            >
              View Progress ({sessionCount} session{sessionCount !== 1 ? "s" : ""})
            </button>
          )}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            "👁️ Webcam landmark tracking",
            "📊 Live scoring (0–100)",
            "🔁 3 reps per session",
            "📋 Therapist-ready summary",
          ].map((f) => (
            <span
              key={f}
              className="text-sm bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

        <DisclaimerBanner />
      </main>

      {/* Footer */}
      <footer className="text-center pb-6">
        <p className="text-xs text-slate-400">
          4 exercises · LocalStorage · No sign-in required
        </p>
      </footer>
    </div>
  );
}
