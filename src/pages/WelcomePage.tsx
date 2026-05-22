import { PlantIllustration } from "../components/PlantIllustration";
import { DisclaimerBanner } from "../components/DisclaimerBanner";

interface WelcomePageProps {
  onStart: () => void;
  onDemo: () => void;
}

export function WelcomePage({ onStart, onDemo }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Brand */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PlantIllustration stage={4} size={80} />
          </div>
          <h1 className="text-5xl font-black text-orange-600 tracking-tight leading-none">
            Speech<span className="text-green-600">Sprout</span>
          </h1>
          <p className="mt-3 text-lg font-bold text-slate-700 leading-snug">
            Practise. Grow. Shine! 🌟
          </p>
        </div>

        {/* Value card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 p-6 w-full text-center border border-orange-100">
          <p className="text-base font-semibold text-slate-700 leading-relaxed mb-4">
            SpeechSprout helps children complete{" "}
            <span className="text-orange-600">therapist-prescribed</span> speech practice at home through playful, short activities.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🎤", label: "Say it" },
              { icon: "💧", label: "Water it" },
              { icon: "🌸", label: "Grow it" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-amber-50 rounded-2xl py-3 px-1">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs font-bold text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onStart}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200 transition-all duration-150 active:scale-95"
          >
            Start Practice 🌱
          </button>
          <button
            onClick={onDemo}
            className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 font-bold text-base rounded-full py-3.5 border-2 border-slate-200 transition-all duration-150 active:scale-95"
          >
            View Demo
          </button>
        </div>

        {/* Disclaimer */}
        <DisclaimerBanner />

        {/* For clinicians note */}
        <p className="text-xs text-slate-400 text-center">
          Activity targets are selected by a parent or clinician — SpeechSprout does not prescribe therapy.
        </p>
      </div>
    </div>
  );
}
