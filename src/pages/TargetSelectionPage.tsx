import { SPEECH_TARGETS } from "../data/speechTargets";
import { TargetBadge } from "../components/TargetBadge";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import type { ChildProfile, SpeechTarget } from "../types";

interface TargetSelectionPageProps {
  child: ChildProfile;
  onSelect: (target: SpeechTarget) => void;
  onBack: () => void;
}

const COLOR_MAP: Record<string, string> = {
  orange: "from-orange-400 to-orange-600",
  blue: "from-blue-400 to-blue-600",
  purple: "from-purple-400 to-purple-600",
  green: "from-green-400 to-green-600",
  yellow: "from-amber-400 to-yellow-500",
  red: "from-rose-400 to-red-500",
};

export function TargetSelectionPage({ child, onSelect, onBack }: TargetSelectionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
        {/* Header */}
        <div>
          <button onClick={onBack} className="text-slate-500 text-sm font-semibold mb-3 flex items-center gap-1 hover:text-slate-700">
            ← Back
          </button>
          <h2 className="text-3xl font-black text-slate-800">Choose a target</h2>
          <p className="mt-1 text-slate-500 text-sm font-medium">
            Hi {child.nickname}! Which sound are you practising today?{" "}
            <span className="text-orange-500 font-bold">(Select what your therapist recommended.)</span>
          </p>
        </div>

        {/* Target cards */}
        <div className="flex flex-col gap-3">
          {SPEECH_TARGETS.map((target) => (
            <button
              key={target.id}
              onClick={() => onSelect(target)}
              className="bg-white rounded-3xl shadow-md shadow-orange-100 p-4 text-left border border-slate-100 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 active:scale-[0.98] transition-all duration-150"
            >
              <div className="flex items-start gap-4">
                {/* Sound badge */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${COLOR_MAP[target.color] ?? "from-slate-400 to-slate-600"} flex flex-col items-center justify-center shadow-md`}>
                  <span className="text-white font-black text-2xl leading-none">{target.label}</span>
                  <span className="text-white/80 text-xs font-semibold">{target.ipa}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-slate-800 text-base">{target.label} {target.ipa}</span>
                    <span className="text-lg">{target.emoji}</span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium capitalize mb-2">
                    {target.place} {target.manner} · {target.voicing}
                  </p>

                  {/* Example words */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {target.exampleWords.map((word) => (
                      <span key={word} className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full px-2 py-0.5">
                        {word}
                      </span>
                    ))}
                  </div>

                  <TargetBadge feedbackMode={target.feedbackMode} visibility={target.visibility} size="sm" />
                </div>
              </div>

              {/* Why no visual note */}
              {target.visibility === "low" && (
                <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2 leading-snug">
                  📝 {target.parentCue}
                </p>
              )}
            </button>
          ))}
        </div>

        <DisclaimerBanner compact />
      </div>
    </div>
  );
}
