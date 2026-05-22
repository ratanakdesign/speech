import { useState } from "react";
import { SPEECH_TARGETS } from "../data/speechTargets";
import { generateClinicianSummary } from "../lib/summaries";
import { TargetBadge } from "../components/TargetBadge";
import type { ChildProfile, PracticeSession } from "../types";

interface ClinicianSummaryPageProps {
  child: ChildProfile;
  sessions: PracticeSession[];
  onBack: () => void;
}

export function ClinicianSummaryPage({ child, sessions, onBack }: ClinicianSummaryPageProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(() => {
    const lastTarget = sessions[sessions.length - 1]?.targetId;
    return lastTarget ?? SPEECH_TARGETS[0].id;
  });
  const [copied, setCopied] = useState(false);

  const target = SPEECH_TARGETS.find((t) => t.id === selectedTargetId) ?? SPEECH_TARGETS[0];
  const summary = generateClinicianSummary(child, target, sessions);

  function handleCopy() {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const practicedTargetIds = [...new Set(sessions.map((s) => s.targetId))];
  const practicedTargets = SPEECH_TARGETS.filter((t) => practicedTargetIds.includes(t.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
        {/* Header */}
        <div>
          <button onClick={onBack} className="text-slate-500 text-sm font-semibold mb-3 flex items-center gap-1 hover:text-slate-700">
            ← Back
          </button>
          <h2 className="text-3xl font-black text-slate-800">Clinician Summary</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            A copyable practice behaviour report for your speech pathologist.
          </p>
        </div>

        {/* Target selector (if multiple practiced) */}
        {practicedTargets.length > 1 && (
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">Select target to report</p>
            <div className="flex flex-wrap gap-2">
              {practicedTargets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTargetId(t.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-bold border-2 transition-all ${
                    selectedTargetId === t.id
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
                  }`}
                >
                  {t.label} {t.ipa}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Target meta card */}
        <div className="bg-white rounded-3xl shadow-md p-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-black text-xl">{target.label}</span>
            </div>
            <div>
              <p className="font-black text-slate-800">{target.label} {target.ipa}</p>
              <p className="text-xs text-slate-500 capitalize">{target.place} {target.manner} · {target.voicing}</p>
            </div>
          </div>
          <TargetBadge feedbackMode={target.feedbackMode} visibility={target.visibility} />
          {target.feedbackMode === "audio_only" && (
            <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
              📝 Visual scoring was not used for this target — tongue placement is not reliably visible through the camera.
            </p>
          )}
        </div>

        {/* Summary text */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Practice Report</span>
            <button
              onClick={handleCopy}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white"
              }`}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <pre className="p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
            {summary}
          </pre>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Important: </strong>
            This summary describes home-practice behaviour only. It is not a clinical assessment and must not be used for diagnosis or treatment planning.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-base rounded-full py-4 shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          {copied ? "✓ Copied to clipboard!" : "📋 Copy Summary"}
        </button>
      </div>
    </div>
  );
}
