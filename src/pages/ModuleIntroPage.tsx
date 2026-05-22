import type { AgeRange, ChildProfile, MapModule, SpeechTarget } from "../types";

function ageInstruction(ageRange: AgeRange, moduleName: string): string {
  switch (ageRange) {
    case "3-5":
      return `Time for ${moduleName}! Copy what you see and hear. Let's make some sounds! 🎉`;
    case "6-8":
      return `Welcome to ${moduleName}! Practice each word below and try to feel your mouth move! 💪`;
    case "9-12":
      return `${moduleName}: work through each word and notice exactly how your mouth is moving. 🧠`;
  }
}

function feedbackBadge(mode: string): { icon: string; label: string; cls: string } {
  if (mode === "audio_plus_visual") {
    return { icon: "📷", label: "Visual + Audio feedback", cls: "bg-orange-100 text-orange-700 border-orange-200" };
  }
  if (mode === "audio_only") {
    return { icon: "🎤", label: "Audio feedback only", cls: "bg-blue-100 text-blue-700 border-blue-200" };
  }
  return { icon: "👁", label: "Visual movement feedback", cls: "bg-purple-100 text-purple-700 border-purple-200" };
}

interface ModuleIntroPageProps {
  module: MapModule;
  target: SpeechTarget;
  child: ChildProfile;
  onStartPractice: () => void;
  onSeeTheSound: () => void;
  onBack: () => void;
}

export function ModuleIntroPage({
  module,
  target,
  child,
  onStartPractice,
  onSeeTheSound,
  onBack,
}: ModuleIntroPageProps) {
  const instruction = ageInstruction(child.ageRange, module.title);
  const badge = feedbackBadge(target.feedbackMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button
          onClick={onBack}
          className="text-slate-500 font-semibold text-sm hover:text-slate-700 transition-colors"
        >
          ← Back
        </button>
        <span className="font-black text-orange-600 text-sm">{target.ipa}</span>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pb-8 gap-4 overflow-y-auto">
        {/* Module hero card */}
        <div
          className={`w-full max-w-sm rounded-3xl border-2 ${module.bgColor} ${module.borderColor} p-6 flex flex-col items-center gap-2 shadow-lg`}
          style={{ boxShadow: `0 6px 28px ${module.color}20` }}
        >
          <span className="text-7xl">{module.emoji}</span>
          <h1 className="font-black text-slate-800 text-2xl text-center leading-tight">
            {module.title}
          </h1>
          <p className="font-semibold text-slate-600 text-sm text-center">{module.subtitle}</p>
          <span className={`text-xs font-bold rounded-full px-3 py-1 border mt-1 ${badge.cls}`}>
            {badge.icon} {badge.label}
          </span>
        </div>

        {/* Age-appropriate instruction */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 w-full max-w-sm text-center">
          <p className="text-sm font-semibold text-slate-700">{instruction}</p>
        </div>

        {/* Practice words */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-md p-5 w-full max-w-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 text-center">
            Today's Practice Words
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {module.words.map((word) => (
              <span
                key={word}
                className={`px-3 py-1.5 rounded-full border-2 font-bold text-sm ${module.bgColor} ${module.borderColor} text-slate-700`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Visual cue tip */}
        {target.visualCue && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 w-full max-w-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Mouth Tip
            </p>
            <p className="text-sm font-semibold text-slate-700">{target.visualCue}</p>
          </div>
        )}

        {/* Low-visibility note */}
        {target.visibility === "low" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 w-full max-w-sm">
            <p className="text-xs font-semibold text-amber-700 text-center">
              🎧 This sound happens deep inside the mouth. We track your practice by audio — no camera needed.
            </p>
          </div>
        )}

        {/* See the Sound button (only for visible sounds) */}
        {target.visibility !== "low" && (
          <button
            onClick={onSeeTheSound}
            className="w-full max-w-sm bg-white hover:bg-orange-50 text-orange-600 font-bold text-sm rounded-2xl py-3 border-2 border-orange-200 shadow-sm transition-colors"
          >
            👁 See the Sound — 3D mouth guide
          </button>
        )}

        {/* Start practice CTA */}
        <button
          onClick={onStartPractice}
          className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-full py-5 shadow-lg shadow-orange-200 transition-all duration-150 active:scale-95"
        >
          Let's Practice! {module.emoji}
        </button>

        <p className="text-[10px] text-slate-400 text-center max-w-xs leading-relaxed px-2">
          Practice support only · Not clinical assessment · Always work with your speech therapist
        </p>
      </div>
    </div>
  );
}
