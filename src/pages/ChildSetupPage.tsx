import { useState } from "react";
import type { AgeRange, ChildProfile } from "../types";

interface ChildSetupPageProps {
  onContinue: (profile: ChildProfile) => void;
  onBack: () => void;
}

const AGE_RANGES: { value: AgeRange; label: string; emoji: string }[] = [
  { value: "3-5", label: "3–5 years", emoji: "🐣" },
  { value: "6-8", label: "6–8 years", emoji: "🌱" },
  { value: "9-12", label: "9–12 years", emoji: "🌻" },
];

export function ChildSetupPage({ onContinue, onBack }: ChildSetupPageProps) {
  const [nickname, setNickname] = useState("");
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);

  const canContinue = nickname.trim().length >= 1 && ageRange !== null;

  function handleSubmit() {
    if (!canContinue) return;
    onContinue({
      id: crypto.randomUUID(),
      nickname: nickname.trim(),
      ageRange: ageRange!,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-3xl font-black text-slate-800">Let's get started!</h2>
          <p className="mt-1 text-slate-500 font-medium text-sm">Tell us a little about the child practising today.</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 p-6 flex flex-col gap-5 border border-orange-100">
          {/* Nickname */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Nickname <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Ava, Leo, Sunny..."
              maxLength={20}
              className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-400 focus:ring-0 px-4 py-3 text-lg font-bold text-slate-800 outline-none placeholder:text-slate-300 transition-colors"
            />
          </div>

          {/* Age range */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Age range <span className="text-orange-500">*</span>
            </label>
            <div className="flex gap-2">
              {AGE_RANGES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setAgeRange(value)}
                  className={`flex-1 rounded-2xl py-3 px-2 text-center border-2 font-bold text-sm transition-all duration-150 ${
                    ageRange === value
                      ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-orange-300"
                  }`}
                >
                  <div className="text-xl mb-0.5">{emoji}</div>
                  <div className="text-xs leading-tight">{label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={!canContinue}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200 transition-all duration-150 active:scale-95"
          >
            Continue →
          </button>
          <button
            onClick={onBack}
            className="w-full text-slate-500 font-semibold text-sm py-2 hover:text-slate-700 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
