import { Suspense, useState } from "react";
import { MouthSceneCanvas } from "../components/three/MouthScene";
import { ARTICULATION_GUIDES } from "../data/articulationGuides";
import { TargetBadge } from "../components/TargetBadge";
import type { SpeechTarget } from "../types";

interface SeeTheSoundPageProps {
  target: SpeechTarget;
  onStartPractice: () => void;
  onBack: () => void;
}

function CanvasSkeleton() {
  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center gap-2 animate-pulse" style={{ height: 280 }}>
      <div className="text-4xl">🌀</div>
      <p className="text-xs text-slate-400 font-semibold">Loading 3D guide…</p>
    </div>
  );
}

export function SeeTheSoundPage({ target, onStartPractice, onBack }: SeeTheSoundPageProps) {
  const [showParentDetails, setShowParentDetails] = useState(false);
  const guide = ARTICULATION_GUIDES[target.id];

  if (!guide) {
    // Fallback if no guide defined for this target
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm flex flex-col gap-5">
          <button onClick={onBack} className="text-slate-500 text-sm font-semibold self-start">← Back</button>
          <div className="bg-white rounded-3xl p-6 shadow-md text-center">
            <p className="text-4xl mb-2">{target.emoji}</p>
            <p className="font-black text-2xl text-slate-800">{target.label} {target.ipa}</p>
            <p className="text-slate-500 text-sm mt-2">{target.visualCue ?? target.parentCue}</p>
          </div>
          <button onClick={onStartPractice} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200 active:scale-95 transition-all">
            Start Practice 🌱
          </button>
        </div>
      </div>
    );
  }

  const COLOR_MAP: Record<string, string> = {
    orange: "from-orange-400 to-orange-600",
    blue: "from-blue-400 to-blue-600",
    purple: "from-purple-400 to-purple-600",
    green: "from-green-400 to-green-600",
    yellow: "from-amber-400 to-yellow-500",
    red: "from-rose-400 to-red-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button onClick={onBack} className="text-slate-500 font-semibold text-sm hover:text-slate-700 transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${COLOR_MAP[target.color] ?? "from-orange-400 to-orange-600"} flex items-center justify-center`}>
            <span className="text-white font-black text-sm">{target.label}</span>
          </div>
          <span className="font-black text-slate-800 text-sm">See the Sound</span>
        </div>
        <button
          onClick={onStartPractice}
          className="bg-orange-100 hover:bg-orange-500 text-orange-600 hover:text-white font-bold text-xs rounded-full px-3 py-1.5 transition-all"
        >
          Skip →
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 gap-4 pb-8 max-w-sm mx-auto w-full">
        {/* Target header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="text-3xl">{guide.emoji}</span>
            <h2 className="text-3xl font-black text-slate-800">{target.label} <span className="text-orange-500">{target.ipa}</span></h2>
          </div>
          <p className="text-slate-500 text-sm font-medium capitalize">
            {target.place} {target.manner} · {target.voicing}
          </p>
        </div>

        {/* 3D Canvas */}
        <div className="w-full">
          <Suspense fallback={<CanvasSkeleton />}>
            <MouthSceneCanvas config={guide.scene} height={270} />
          </Suspense>
          <p className="text-center text-xs text-slate-400 font-medium mt-1.5">
            Drag to rotate · Highlighted parts show where the sound is made
          </p>
        </div>

        {/* Audio-only warning */}
        {guide.isInvisibleToCamera && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 w-full">
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">⚠️</span>
              <div>
                <p className="font-bold text-amber-800 text-sm">Audio practice only</p>
                <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">{guide.cameraNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Child instruction card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-orange-100 border border-orange-100 p-5 w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">👶</span>
            <h3 className="font-black text-slate-700 text-sm uppercase tracking-wide">For the child</h3>
          </div>
          <p className="text-base font-bold text-slate-800 leading-snug mb-3">
            {guide.childInstruction}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            {guide.mechanicsExplainer}
          </p>
        </div>

        {/* Badges */}
        <div className="w-full">
          <TargetBadge feedbackMode={target.feedbackMode} visibility={target.visibility} />
        </div>

        {/* Parent details (collapsible) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm w-full">
          <button
            onClick={() => setShowParentDetails((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">👨‍👩‍👧</span>
              <span className="font-bold text-slate-600 text-sm">Parent / Carer cue</span>
            </div>
            <span className="text-slate-400 text-xs font-semibold">{showParentDetails ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {showParentDetails && (
            <div className="px-4 pb-4">
              <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {guide.parentCue}
              </p>
              {guide.isInvisibleToCamera && (
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  📝 Visual guide is for teaching purposes only — this sound cannot be reliably verified through a webcam.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Anatomy key */}
        {(guide.scene.highlightAlveolar || guide.scene.highlightVelar) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm w-full px-4 py-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Guide highlights</p>
            <div className="flex flex-wrap gap-2">
              {guide.scene.highlightAlveolar && (
                <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 text-xs font-bold text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Alveolar ridge
                </span>
              )}
              {guide.scene.highlightVelar && (
                <span className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-1 text-xs font-bold text-purple-700">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Soft palate (velum)
                </span>
              )}
              {(guide.scene.highlightBilabial || guide.scene.highlightLabiodental) && (
                <span className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-1 text-xs font-bold text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Lips
                </span>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onStartPractice}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-full py-5 shadow-lg shadow-orange-200 transition-all duration-150 active:scale-95 mt-1"
        >
          Got it — Start Practice! 🌱
        </button>

        <p className="text-xs text-slate-400 text-center">
          This guide shows placement only. It is not a clinical assessment.
        </p>
      </div>
    </div>
  );
}
