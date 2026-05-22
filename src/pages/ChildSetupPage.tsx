import { useState } from "react";
import { motion } from "framer-motion";
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
      <motion.div
        className="w-full max-w-sm flex flex-col gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Let's get started!</h2>
          <p className="mt-1 text-slate-500 font-semibold text-sm">
            Tell us a little about the child practising today.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/60 p-6 flex flex-col gap-5 border border-orange-100">
          {/* Nickname */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Nickname <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. Ava, Leo, Sunny…"
              maxLength={20}
              className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-400 px-4 py-3 text-lg font-black text-slate-800 outline-none placeholder:text-slate-300 transition-colors"
            />
          </div>

          {/* Age range */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Age range <span className="text-orange-500">*</span>
            </label>
            <div className="flex gap-2">
              {AGE_RANGES.map(({ value, label, emoji }) => {
                const selected = ageRange === value;
                return (
                  <motion.button
                    key={value}
                    onClick={() => setAgeRange(value)}
                    className={`flex-1 rounded-2xl py-3 px-2 text-center border-2 font-bold text-sm transition-colors ${
                      selected
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-orange-200"
                    }`}
                    animate={selected ? { scale: 1.06 } : { scale: 1 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 480, damping: 28 }}
                  >
                    <div className="text-xl mb-0.5">{emoji}</div>
                    <div className="text-xs leading-tight">{label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <motion.button
            onClick={handleSubmit}
            disabled={!canContinue}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200 transition-colors"
            animate={canContinue ? { scale: 1 } : { scale: 0.98 }}
            whileTap={canContinue ? { scale: 0.96 } : {}}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            Continue →
          </motion.button>
          <button
            onClick={onBack}
            className="w-full text-slate-400 font-semibold text-sm py-2 hover:text-slate-600 transition-colors"
          >
            ← Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
