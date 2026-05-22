import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAP_MODULES } from "../data/mapModules";
import { getTargetById } from "../data/speechTargets";
import type { ChildProfile, MapModule, PracticeSession } from "../types";

type StarsCount = 0 | 1 | 2 | 3;

interface ModuleProgress {
  completed: boolean;
  starsEarned: StarsCount;
  sessionCount: number;
}

function computeModuleProgress(sessions: PracticeSession[]): Record<string, ModuleProgress> {
  const progress: Record<string, ModuleProgress> = {};
  for (const s of sessions) {
    if (!s.moduleId) continue;
    const prev = progress[s.moduleId];
    const earned = s.rewardsEarned ?? 0;
    const stars = (earned >= 5 ? 3 : earned >= 3 ? 2 : 1) as StarsCount;
    if (!prev) {
      progress[s.moduleId] = { completed: true, starsEarned: stars, sessionCount: 1 };
    } else {
      progress[s.moduleId] = {
        completed: true,
        starsEarned: Math.max(prev.starsEarned, stars) as StarsCount,
        sessionCount: prev.sessionCount + 1,
      };
    }
  }
  return progress;
}

function getCurrentModuleId(progress: Record<string, ModuleProgress>): string | null {
  for (const m of MAP_MODULES) {
    if (m.unlocked && !m.comingSoon && !progress[m.id]?.completed) return m.id;
  }
  return null;
}

// Connector SVG between map nodes
function PathSegment({ fromRight }: { fromRight: boolean }) {
  const d = fromRight
    ? "M 78 0 C 78 28, 22 28, 22 52"
    : "M 22 0 C 22 28, 78 28, 78 52";
  return (
    <svg
      viewBox="0 0 100 52"
      className="w-full h-14"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d={d}
        stroke="#FCD34D"
        strokeWidth="4"
        strokeDasharray="7 5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

// Compact circular map node
interface MapNodeProps {
  module: MapModule;
  progress: ModuleProgress | undefined;
  isCurrent: boolean;
  side: "left" | "right" | "center";
  index: number;
  onTap: (m: MapModule) => void;
}

function MapNode({ module, progress, isCurrent, side, index, onTap }: MapNodeProps) {
  const completed = progress?.completed ?? false;
  const starsEarned = progress?.starsEarned ?? 0;
  const isLocked = module.comingSoon || !module.unlocked;

  const alignClass =
    side === "left" ? "self-start ml-[10%]" : side === "right" ? "self-end mr-[10%]" : "self-center";

  return (
    <motion.div
      className={`flex flex-col items-center gap-1.5 w-[88px] ${alignClass}`}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 320, damping: 24 }}
    >
      {/* Circle node */}
      {isLocked ? (
        <div className="w-[88px] h-[88px] rounded-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center gap-0.5 opacity-50">
          <span className="text-3xl grayscale">{module.emoji}</span>
          <span className="text-xs">🔒</span>
        </div>
      ) : (
        <motion.button
          className={`relative w-[88px] h-[88px] rounded-full flex items-center justify-center border-2 ${module.bgColor} ${module.borderColor} shadow-lg`}
          style={{
            boxShadow: isCurrent
              ? `0 0 0 0px ${module.color}44, 0 8px 24px ${module.color}33`
              : `0 6px 20px ${module.color}22`,
          }}
          onClick={() => onTap(module)}
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 520, damping: 28 }}
        >
          {/* Current module pulse */}
          {isCurrent && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: module.color }}
                animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: module.color }}
                animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}

          {/* Completed badge */}
          {completed && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-black text-white">✓</span>
            </div>
          )}

          <span className="text-4xl">{module.emoji}</span>
        </motion.button>
      )}

      {/* Name + stars below node */}
      <p
        className={`text-[10px] font-black text-center leading-tight ${
          isLocked ? "text-slate-300" : "text-slate-600"
        }`}
        style={{ maxWidth: 80 }}
      >
        {module.title}
      </p>
      {!isLocked && (
        <div className="flex gap-0.5">
          {[1, 2, 3].map((n) => (
            <span key={n} className="text-[10px]" style={{ opacity: n <= starsEarned ? 1 : 0.18 }}>
              ⭐
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Module bottom sheet
interface ModuleSheetProps {
  module: MapModule;
  onClose: () => void;
  onStart: () => void;
}

function ModuleSheet({ module, onClose, onStart }: ModuleSheetProps) {
  const [showGrownUp, setShowGrownUp] = useState(false);
  const target = getTargetById(module.targetId);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/30 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-3xl shadow-2xl"
        style={{ x: "-50%" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.9 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2 flex flex-col gap-5">
          {/* Module header */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${module.bgColor} border ${module.borderColor}`}
            >
              <span className="text-4xl">{module.emoji}</span>
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-xl leading-tight">{module.title}</h2>
              <p className="text-sm font-semibold text-slate-500 mt-0.5">{module.subtitle}</p>
            </div>
          </div>

          {/* Practice words */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Today's words
            </p>
            <div className="flex flex-wrap gap-2">
              {module.words.map((word) => (
                <span
                  key={word}
                  className={`px-3.5 py-1.5 rounded-full font-black text-sm ${module.bgColor} ${module.borderColor} border text-slate-700`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <motion.button
            onClick={onStart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-full py-4 shadow-xl shadow-orange-200"
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
          >
            Let's go! {module.emoji}
          </motion.button>

          {/* Grown-up accordion */}
          <button
            onClick={() => setShowGrownUp(!showGrownUp)}
            className="flex items-center justify-between w-full text-left py-1"
          >
            <span className="text-xs font-bold text-slate-500">👨‍👩‍👧 Grown-up details</span>
            <span className="text-slate-400 text-xs">{showGrownUp ? "▲" : "▼"}</span>
          </button>

          <AnimatePresence>
            {showGrownUp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-200">
                  {target && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Sound target</span>
                        <span className="text-xs font-black text-slate-700">
                          {target.label} {target.ipa}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Feedback mode</span>
                        <span className="text-xs font-bold text-slate-700 capitalize">
                          {target.feedbackMode === "audio_plus_visual"
                            ? "📷 Visual + Audio"
                            : target.feedbackMode === "audio_only"
                            ? "🎤 Audio only"
                            : "👁 Visual"}
                        </span>
                      </div>
                      {target.visualCue && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 block mb-1">
                            Mouth tip
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">{target.visualCue}</p>
                        </div>
                      )}
                    </>
                  )}
                  <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-200 pt-3 mt-1">
                    SpeechSprout supports home practice only. It does not diagnose or treat speech
                    disorders. Always work with a qualified speech-language pathologist.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

interface LearningMapPageProps {
  child: ChildProfile;
  sessions: PracticeSession[];
  onSelectModule: (module: MapModule) => void;
  onParentView: () => void;
}

const SIDES: ("left" | "right" | "left" | "right" | "center")[] = [
  "left",
  "right",
  "left",
  "right",
  "center",
];

// Decorative environment emoji positioned between nodes
const ENV_ELEMENTS = [
  { emoji: "☁️", top: 20, right: "8%", size: "text-2xl", opacity: 0.55 },
  { emoji: "🌻", top: 70, right: "4%", size: "text-xl", opacity: 0.75 },
  { emoji: "🐸", top: 215, left: "5%", size: "text-lg", opacity: 0.8 },
  { emoji: "🍄", top: 355, right: "5%", size: "text-xl", opacity: 0.8 },
  { emoji: "☁️", top: 430, left: "8%", size: "text-xl", opacity: 0.5 },
  { emoji: "🌿", top: 520, right: "6%", size: "text-lg", opacity: 0.7 },
  { emoji: "⭐", top: 620, left: "6%", size: "text-base", opacity: 0.85 },
];

export function LearningMapPage({
  child,
  sessions,
  onSelectModule,
  onParentView,
}: LearningMapPageProps) {
  const [previewModule, setPreviewModule] = useState<MapModule | null>(null);

  const moduleProgress = computeModuleProgress(sessions);
  const currentModuleId = getCurrentModuleId(moduleProgress);
  const totalStars = Object.values(moduleProgress).reduce((s, p) => s + p.starsEarned, 0);

  const handleNodeTap = useCallback((m: MapModule) => {
    setPreviewModule(m);
  }, []);

  const handleStart = useCallback(() => {
    if (previewModule) {
      setPreviewModule(null);
      onSelectModule(previewModule);
    }
  }, [previewModule, onSelectModule]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-amber-50 flex flex-col">
      {/* Header */}
      <motion.div
        className="px-5 pt-5 pb-3 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Hi {child.nickname}! 🌱
          </h1>
          {totalStars > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 rounded-full px-2.5 py-1 mt-1.5">
              ⭐ {totalStars} {totalStars === 1 ? "star" : "stars"} earned
            </span>
          )}
        </div>
        <motion.button
          onClick={onParentView}
          className="text-xs font-bold text-slate-500 bg-white rounded-full px-3 py-2 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors shrink-0"
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        >
          👨‍👩‍👧 Grown-ups
        </motion.button>
      </motion.div>

      {/* Adventure map */}
      <div className="flex-1 overflow-y-auto pb-16 pt-2">
        <div className="relative px-4 flex flex-col" style={{ minHeight: 760 }}>
          {/* Decorative environment elements */}
          {ENV_ELEMENTS.map((el, i) => (
            <span
              key={i}
              className={`absolute ${el.size} select-none pointer-events-none`}
              style={{
                top: el.top,
                left: el.left,
                right: el.right,
                opacity: el.opacity,
              }}
            >
              {el.emoji}
            </span>
          ))}

          {/* Nodes with connectors */}
          {MAP_MODULES.map((module, index) => {
            const side = SIDES[index] ?? "center";
            const isLast = index === MAP_MODULES.length - 1;

            return (
              <div key={module.id} className="flex flex-col">
                <MapNode
                  module={module}
                  progress={moduleProgress[module.id]}
                  isCurrent={module.id === currentModuleId}
                  side={side}
                  index={index}
                  onTap={handleNodeTap}
                />
                {!isLast && <PathSegment fromRight={side === "right"} />}
              </div>
            );
          })}

          {/* Footer */}
          <div className="mt-8 mx-2 p-3 bg-white/60 rounded-2xl border border-slate-200/50">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              SpeechSprout supports home practice only · Not a clinical assessment ·
              Always work with a speech-language pathologist
            </p>
          </div>
        </div>
      </div>

      {/* Module bottom sheet */}
      <AnimatePresence>
        {previewModule && (
          <ModuleSheet
            module={previewModule}
            onClose={() => setPreviewModule(null)}
            onStart={handleStart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
