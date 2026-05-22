import { useCallback } from "react";
import { motion } from "framer-motion";
import { MAP_MODULES } from "../data/mapModules";
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

function PathConnector({ fromLeft }: { fromLeft: boolean }) {
  return (
    <div className="relative h-16 w-full" aria-hidden="true">
      <svg
        viewBox="0 0 100 64"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <path
          d={fromLeft ? "M 28 0 Q 28 32 50 32 Q 72 32 72 64" : "M 72 0 Q 72 32 50 32 Q 28 32 28 64"}
          stroke="#FCD34D"
          strokeWidth="3.5"
          strokeDasharray="7 5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

interface ModuleNodeProps {
  module: MapModule;
  progress: ModuleProgress | undefined;
  isRight: boolean;
  onSelect: (m: MapModule) => void;
  index: number;
}

function ModuleNode({ module, progress, isRight, onSelect, index }: ModuleNodeProps) {
  const completed = progress?.completed ?? false;
  const starsEarned = progress?.starsEarned ?? 0;
  const isLocked = module.comingSoon || !module.unlocked;
  const posClass = isRight ? "ml-auto mr-5" : "ml-5 mr-auto";

  if (isLocked) {
    return (
      <motion.div
        className={`relative flex flex-col items-center gap-2 w-56 rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 ${posClass}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
      >
        <div className="absolute top-3 right-3 text-slate-300 text-sm">🔒</div>
        <span className="text-5xl grayscale opacity-35 mt-1">{module.emoji}</span>
        <div className="text-center">
          <p className="font-black text-slate-300 text-sm leading-tight">{module.title}</p>
          <p className="text-xs text-slate-300 mt-0.5">{module.subtitle}</p>
        </div>
        <span className="text-[10px] font-bold text-slate-300 bg-slate-100 rounded-full px-2.5 py-1 border border-slate-200">
          Coming Soon
        </span>
      </motion.div>
    );
  }

  return (
    <motion.button
      className={`relative flex flex-col items-center gap-2 w-56 rounded-3xl border-2 p-5 text-left cursor-pointer ${module.bgColor} ${module.borderColor} ${posClass}`}
      style={{ boxShadow: `0 8px 28px ${module.color}22` }}
      onClick={() => onSelect(module)}
      whileTap={{ scale: 0.91 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        tap: { type: "spring", stiffness: 520, damping: 32 },
        default: { delay: index * 0.06, duration: 0.3, ease: "easeOut" },
      }}
    >
      {/* Completion badge */}
      {completed ? (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
          ✓
        </div>
      ) : (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-sm"
          style={{ backgroundColor: module.color }}
        >
          ▶
        </div>
      )}

      <span className="text-5xl mt-1">{module.emoji}</span>

      <div className="text-center w-full">
        <p className="font-black text-slate-800 text-sm leading-tight">{module.title}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{module.subtitle}</p>
      </div>

      {/* Stars */}
      <div className="flex gap-1 justify-center">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="text-sm"
            style={{ opacity: n <= starsEarned ? 1 : 0.18 }}
          >
            ⭐
          </span>
        ))}
      </div>
    </motion.button>
  );
}

interface LearningMapPageProps {
  child: ChildProfile;
  sessions: PracticeSession[];
  onSelectModule: (module: MapModule) => void;
  onParentView: () => void;
}

export function LearningMapPage({ child, sessions, onSelectModule, onParentView }: LearningMapPageProps) {
  const moduleProgress = computeModuleProgress(sessions);
  const totalStars = Object.values(moduleProgress).reduce((s, p) => s + p.starsEarned, 0);
  const completedCount = Object.values(moduleProgress).filter((p) => p.completed).length;

  const handleSelect = useCallback(
    (m: MapModule) => {
      if (!m.comingSoon && m.unlocked) onSelectModule(m);
    },
    [onSelectModule]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-amber-50 to-orange-50 flex flex-col">
      {/* Header */}
      <motion.div
        className="px-5 pt-6 pb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Hi {child.nickname}! 🌱
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {totalStars > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 rounded-full px-2.5 py-1">
                  ⭐ {totalStars} {totalStars === 1 ? "star" : "stars"}
                </span>
              )}
              {sessions.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-white rounded-full px-2.5 py-1 border border-slate-200">
                  {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
                </span>
              )}
              {completedCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 rounded-full px-2.5 py-1">
                  ✓ {completedCount} {completedCount === 1 ? "zone" : "zones"}
                </span>
              )}
            </div>
          </div>
          <motion.button
            onClick={onParentView}
            className="text-xs font-bold text-slate-500 bg-white rounded-full px-3 py-1.5 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors shrink-0 mt-0.5"
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            Parent View
          </motion.button>
        </div>

        <p className="text-sm font-semibold text-slate-400 mt-3">
          Choose a sound garden to explore 👇
        </p>
      </motion.div>

      {/* Map */}
      <div className="flex-1 pb-12 pt-1 relative overflow-hidden">
        {/* Subtle background decorations */}
        <span className="absolute top-4 left-[62%] text-2xl opacity-10 select-none pointer-events-none">☁️</span>
        <span className="absolute top-32 left-[6%] text-xl opacity-10 select-none pointer-events-none">🌳</span>
        <span className="absolute top-60 left-[70%] text-xl opacity-10 select-none pointer-events-none">🌿</span>
        <span className="absolute top-96 left-[8%] text-lg opacity-10 select-none pointer-events-none">🌸</span>
        <span className="absolute top-[28rem] left-[68%] text-lg opacity-10 select-none pointer-events-none">⭐</span>

        {MAP_MODULES.map((module, index) => {
          const isRight = index % 2 === 1;
          return (
            <div key={module.id}>
              <ModuleNode
                module={module}
                progress={moduleProgress[module.id]}
                isRight={isRight}
                onSelect={handleSelect}
                index={index}
              />
              {index < MAP_MODULES.length - 1 && (
                <PathConnector fromLeft={!isRight} />
              )}
            </div>
          );
        })}

        <div className="mx-5 mt-8 p-3 bg-white/60 rounded-2xl border border-slate-200/60">
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            SpeechSprout supports home practice only and does not diagnose or treat speech disorders.
            Always work with a qualified speech-language pathologist.
          </p>
        </div>
      </div>
    </div>
  );
}
