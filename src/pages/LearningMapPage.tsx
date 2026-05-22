import { useCallback } from "react";
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
    <div className="relative h-14 w-full" aria-hidden="true">
      <svg
        viewBox="0 0 100 56"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <path
          d={
            fromLeft
              ? "M 25 0 Q 25 28 50 28 Q 75 28 75 56"
              : "M 75 0 Q 75 28 50 28 Q 25 28 25 56"
          }
          stroke="#FCD34D"
          strokeWidth="3"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function StarRow({ earned }: { earned: number }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="text-sm"
          style={{ opacity: n <= earned ? 1 : 0.22 }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

interface ModuleNodeProps {
  module: MapModule;
  progress: ModuleProgress | undefined;
  isRight: boolean;
  onSelect: (m: MapModule) => void;
}

function ModuleNode({ module, progress, isRight, onSelect }: ModuleNodeProps) {
  const completed = progress?.completed ?? false;
  const starsEarned = progress?.starsEarned ?? 0;
  const isLocked = module.comingSoon || !module.unlocked;

  const positionClass = isRight ? "ml-auto mr-6" : "ml-6 mr-auto";

  if (isLocked) {
    return (
      <div
        className={`relative flex flex-col items-center gap-1.5 w-44 rounded-3xl border-2 border-slate-200 bg-slate-100 p-4 shadow-sm select-none ${positionClass}`}
      >
        <div className="absolute top-2 right-2 text-sm text-slate-300">🔒</div>
        <span className="text-4xl grayscale opacity-40">{module.emoji}</span>
        <p className="font-black text-slate-400 text-sm text-center leading-tight">{module.title}</p>
        <p className="text-xs text-slate-400 text-center">{module.subtitle}</p>
        <span className="mt-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full px-2 py-0.5">
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(module)}
      className={`relative flex flex-col items-center gap-1.5 w-44 rounded-3xl border-2 p-4 shadow-lg active:scale-95 transition-transform duration-150 ${module.bgColor} ${module.borderColor} ${positionClass}`}
      style={{ boxShadow: `0 6px 24px ${module.color}2a` }}
    >
      {completed ? (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          ✓
        </div>
      ) : (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
          style={{ backgroundColor: module.color }}
        >
          ▶
        </div>
      )}
      <span className="text-5xl">{module.emoji}</span>
      <p className="font-black text-slate-800 text-sm text-center leading-tight">{module.title}</p>
      <p className="text-xs text-slate-500 text-center">{module.subtitle}</p>
      <StarRow earned={starsEarned} />
    </button>
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
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Hi {child.nickname}! 🌱</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm font-semibold text-amber-600">
                ⭐ {totalStars} {totalStars === 1 ? "star" : "stars"}
              </span>
              <span className="text-sm font-semibold text-slate-400">·</span>
              <span className="text-sm font-semibold text-slate-500">
                {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
              </span>
              {completedCount > 0 && (
                <>
                  <span className="text-sm font-semibold text-slate-400">·</span>
                  <span className="text-sm font-semibold text-green-600">
                    {completedCount} {completedCount === 1 ? "zone" : "zones"} visited
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onParentView}
            className="text-xs font-bold text-slate-500 bg-white rounded-full px-3 py-1.5 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors shrink-0"
          >
            Parent View
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-500 mt-3">
          Pick a sound garden to practice in 👇
        </p>
      </div>

      {/* Map area */}
      <div className="flex-1 pb-10 pt-2 relative overflow-hidden">
        {/* Decorative background elements */}
        <span className="absolute top-2 left-[64%] text-2xl opacity-15 select-none pointer-events-none">☁️</span>
        <span className="absolute top-28 left-[8%] text-xl opacity-15 select-none pointer-events-none">🌳</span>
        <span className="absolute top-52 left-[68%] text-xl opacity-15 select-none pointer-events-none">🌿</span>
        <span className="absolute top-[18rem] left-[7%] text-xl opacity-15 select-none pointer-events-none">🌸</span>
        <span className="absolute top-[26rem] left-[65%] text-lg opacity-15 select-none pointer-events-none">⭐</span>
        <span className="absolute top-[34rem] left-[9%] text-xl opacity-10 select-none pointer-events-none">🦋</span>

        {MAP_MODULES.map((module, index) => {
          const isRight = index % 2 === 1;
          return (
            <div key={module.id}>
              <ModuleNode
                module={module}
                progress={moduleProgress[module.id]}
                isRight={isRight}
                onSelect={handleSelect}
              />
              {index < MAP_MODULES.length - 1 && (
                <PathConnector fromLeft={!isRight} />
              )}
            </div>
          );
        })}

        {/* Footer disclaimer */}
        <div className="mx-4 mt-6 p-3 bg-white/70 rounded-2xl border border-slate-200">
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            SpeechSprout supports home practice only and does not diagnose or treat speech disorders.
            Work with a qualified speech-language pathologist for clinical support.
          </p>
        </div>
      </div>
    </div>
  );
}
