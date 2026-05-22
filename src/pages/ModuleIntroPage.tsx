import { motion } from "framer-motion";
import type { AgeRange, ChildProfile, MapModule, SpeechTarget } from "../types";

function ageInstruction(ageRange: AgeRange, moduleName: string): string {
  switch (ageRange) {
    case "3-5":
      return `Let's visit ${moduleName}! Copy the sounds and have fun! 🎉`;
    case "6-8":
      return `Time to practise in ${moduleName}! Try each word and feel your mouth move. 💪`;
    case "9-12":
      return `${moduleName}: work through each word. Notice exactly how your mouth is moving. 🧠`;
  }
}

function feedbackBadgeConfig(mode: string): { icon: string; label: string; cls: string } {
  if (mode === "audio_plus_visual")
    return { icon: "📷", label: "Visual + Audio", cls: "bg-orange-100 text-orange-700 border-orange-200" };
  if (mode === "audio_only")
    return { icon: "🎤", label: "Audio only", cls: "bg-blue-100 text-blue-700 border-blue-200" };
  return { icon: "👁", label: "Visual movement", cls: "bg-purple-100 text-purple-700 border-purple-200" };
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
  const badge = feedbackBadgeConfig(target.feedbackMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Top nav */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <motion.button
          onClick={onBack}
          className="text-slate-500 font-semibold text-sm hover:text-slate-700 transition-colors"
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        >
          ← Back
        </motion.button>
        <span className="font-black text-orange-500 text-sm tracking-wide">{target.ipa}</span>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex flex-col items-center px-5 pb-8 gap-4 overflow-y-auto">
        {/* Module hero */}
        <motion.div
          className={`w-full max-w-sm rounded-3xl border-2 ${module.bgColor} ${module.borderColor} p-6 flex flex-col items-center gap-3 shadow-xl`}
          style={{ boxShadow: `0 8px 32px ${module.color}1e` }}
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.05 }}
        >
          <motion.span
            className="text-8xl"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
          >
            {module.emoji}
          </motion.span>
          <div className="text-center">
            <h1 className="font-black text-slate-800 text-2xl tracking-tight leading-tight">
              {module.title}
            </h1>
            <p className="font-semibold text-slate-500 text-sm mt-1">{module.subtitle}</p>
          </div>
          <span className={`text-xs font-bold rounded-full px-3 py-1 border ${badge.cls}`}>
            {badge.icon} {badge.label}
          </span>
        </motion.div>

        {/* Instruction */}
        <motion.div
          className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 w-full max-w-sm text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.28, ease: "easeOut" }}
        >
          <p className="text-sm font-semibold text-slate-700">{instruction}</p>
        </motion.div>

        {/* Practice words */}
        <motion.div
          className="bg-white rounded-3xl border border-orange-100 shadow-md p-5 w-full max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.28, ease: "easeOut" }}
        >
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
            Today's Words
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {module.words.map((word, i) => (
              <motion.div
                key={word}
                className={`px-4 py-2 rounded-full border-2 font-black text-sm ${module.bgColor} ${module.borderColor} text-slate-700 cursor-default select-none`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.34 + i * 0.06,
                  type: "spring",
                  stiffness: 380,
                  damping: 22,
                }}
                whileTap={{ scale: 0.92 }}
              >
                {word}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Visual cue */}
        {target.visualCue && (
          <motion.div
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full max-w-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.25, ease: "easeOut" }}
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Mouth tip
            </p>
            <p className="text-sm font-semibold text-slate-700">{target.visualCue}</p>
          </motion.div>
        )}

        {/* Low-visibility note */}
        {target.visibility === "low" && (
          <motion.div
            className="bg-amber-50 border border-amber-200 rounded-2xl p-3 w-full max-w-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.25, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold text-amber-700 text-center">
              🎧 This sound happens inside the mouth — we track your practice by audio, no camera needed.
            </p>
          </motion.div>
        )}

        {/* See the Sound link */}
        {target.visibility !== "low" && (
          <motion.button
            onClick={onSeeTheSound}
            className="w-full max-w-sm bg-white text-orange-600 font-bold text-sm rounded-2xl py-3 border-2 border-orange-200 shadow-sm hover:bg-orange-50 transition-colors"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.25, ease: "easeOut" }}
            whileTap={{ scale: 0.97 }}
          >
            👁 See the Sound — 3D mouth guide
          </motion.button>
        )}

        {/* Start CTA */}
        <motion.button
          onClick={onStartPractice}
          className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-full py-5 shadow-xl shadow-orange-200"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.96 }}
        >
          Let's Practice! {module.emoji}
        </motion.button>

        <p className="text-[10px] text-slate-400 text-center max-w-xs leading-relaxed">
          Practice support only · Not clinical assessment · Always work with your speech therapist
        </p>
      </div>
    </div>
  );
}
