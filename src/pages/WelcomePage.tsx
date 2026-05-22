import { motion } from "framer-motion";
import { PlantIllustration } from "../components/PlantIllustration";
import { DisclaimerBanner } from "../components/DisclaimerBanner";

interface WelcomePageProps {
  onStart: () => void;
  onDemo: () => void;
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  hidden: {},
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function WelcomePage({ onStart, onDemo }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-5 py-10">
      <motion.div
        className="w-full max-w-sm flex flex-col items-center gap-6"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Brand */}
        <motion.div className="text-center" variants={fadeUp}>
          <motion.div
            className="flex items-center justify-center mb-2"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
          >
            <PlantIllustration stage={4} size={84} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            <span className="text-orange-500">Speech</span>
            <span className="text-green-600">Sprout</span>
          </h1>
          <p className="mt-3 text-lg font-bold text-slate-600">
            Practise. Grow. Shine! 🌟
          </p>
        </motion.div>

        {/* Value card */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl shadow-orange-100/60 p-6 w-full text-center border border-orange-100"
          variants={fadeUp}
        >
          <p className="text-base font-semibold text-slate-600 leading-relaxed mb-5">
            Playful speech practice activities designed to complement work with a{" "}
            <span className="text-orange-500 font-bold">speech-language pathologist</span>.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🎤", label: "Say it" },
              { icon: "💧", label: "Water it" },
              { icon: "🌸", label: "Grow it" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-amber-50 rounded-2xl py-3.5 px-1">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs font-bold text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div className="flex flex-col gap-3 w-full" variants={fadeUp}>
          <motion.button
            onClick={onStart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-full py-4 shadow-lg shadow-orange-200"
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
          >
            Start Practice 🌱
          </motion.button>
          <motion.button
            onClick={onDemo}
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold text-base rounded-full py-3.5 border-2 border-slate-200 hover:border-slate-300 transition-colors"
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
          >
            View Demo
          </motion.button>
        </motion.div>

        {/* Disclaimer */}
        <motion.div className="w-full" variants={fadeUp}>
          <DisclaimerBanner />
        </motion.div>

        <motion.p className="text-xs text-slate-400 text-center" variants={fadeUp}>
          Activity targets are selected by a parent or clinician.
          SpeechSprout does not prescribe therapy.
        </motion.p>
      </motion.div>
    </div>
  );
}
