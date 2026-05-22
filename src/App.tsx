import { useCallback, useState } from "react";
import { WelcomePage } from "./pages/WelcomePage";
import { ChildSetupPage } from "./pages/ChildSetupPage";
import { LearningMapPage } from "./pages/LearningMapPage";
import { PracticePage } from "./pages/PracticePage";
import { SessionCompletePage } from "./pages/SessionCompletePage";
import { ParentDashboardPage } from "./pages/ParentDashboardPage";
import { ClinicianSummaryPage } from "./pages/ClinicianSummaryPage";
import { SeeTheSoundPage } from "./pages/SeeTheSoundPage";
import { useSessions } from "./hooks/useSessions";
import { loadChild, saveSessions } from "./lib/storage";
import { getTargetById } from "./data/speechTargets";
import type { AppPage, ChildProfile, MapModule, PracticeSession, SpeechTarget } from "./types";

export function App() {
  const [page, setPage] = useState<AppPage>(() => (loadChild() ? "map" : "landing"));
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedModule, setSelectedModule] = useState<MapModule | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<SpeechTarget | null>(null);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);

  const { child, sessions, saveChildProfile, addSession, clearData } = useSessions();

  const handleStart = useCallback(() => {
    setIsDemoMode(false);
    setPage(child ? "map" : "child-setup");
  }, [child]);

  const handleDemo = useCallback(() => {
    setIsDemoMode(true);
    setPage(child ? "map" : "child-setup");
  }, [child]);

  const handleChildSetup = useCallback(
    (profile: ChildProfile) => {
      saveChildProfile({ ...profile, hasCompletedSetup: true });
      setPage("map");
    },
    [saveChildProfile]
  );

  // Called from LearningMapPage bottom sheet "Let's go!" — goes straight to practice
  const handleSelectModule = useCallback((m: MapModule) => {
    const target = getTargetById(m.targetId);
    if (!target) return;
    setSelectedModule(m);
    setSelectedTarget(target);
    setPage("practice");
  }, []);

  const handleSessionComplete = useCallback(
    (session: PracticeSession) => {
      addSession(session);
      setCurrentSession(session);
      setPage("session-complete");
    },
    [addSession]
  );

  const handleUpdateSession = useCallback(
    (updated: PracticeSession) => {
      const newSessions = sessions.map((s) => (s.id === updated.id ? updated : s));
      saveSessions(newSessions);
      setCurrentSession(updated);
    },
    [sessions]
  );

  return (
    // Mobile-first container: full screen on mobile, centered 430px phone frame on desktop
    <div className="min-h-screen bg-amber-100/70 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl shadow-amber-200/50 relative overflow-hidden">
        {page === "landing" && (
          <WelcomePage onStart={handleStart} onDemo={handleDemo} />
        )}

        {page === "child-setup" && (
          <ChildSetupPage
            onContinue={handleChildSetup}
            onBack={() => setPage("landing")}
          />
        )}

        {page === "map" && child && (
          <LearningMapPage
            child={child}
            sessions={sessions}
            onSelectModule={handleSelectModule}
            onParentView={() => setPage("parent-dashboard")}
          />
        )}

        {page === "see-the-sound" && selectedTarget && (
          <SeeTheSoundPage
            target={selectedTarget}
            onStartPractice={() => setPage("practice")}
            onBack={() => setPage(selectedModule ? "practice" : "map")}
          />
        )}

        {page === "practice" && child && selectedTarget && selectedModule && (
          <PracticePage
            key={selectedModule.id + String(isDemoMode)}
            child={child}
            module={selectedModule}
            target={selectedTarget}
            isDemoMode={isDemoMode}
            onComplete={handleSessionComplete}
            onExit={() => setPage("map")}
            onViewGuide={() => setPage("see-the-sound")}
          />
        )}

        {page === "session-complete" && currentSession && (
          <SessionCompletePage
            session={currentSession}
            onUpdateSession={handleUpdateSession}
            onViewDashboard={() => setPage("parent-dashboard")}
            onPracticeAgain={() => setPage("map")}
          />
        )}

        {page === "parent-dashboard" && child && (
          <ParentDashboardPage
            child={child}
            sessions={sessions}
            onClinicianSummary={() => setPage("clinician-summary")}
            onPractice={() => setPage("map")}
            onBack={() => setPage(sessions.length > 0 ? "map" : "landing")}
            onClearData={clearData}
          />
        )}

        {page === "clinician-summary" && child && (
          <ClinicianSummaryPage
            child={child}
            sessions={sessions}
            onBack={() => setPage("parent-dashboard")}
          />
        )}
      </div>
    </div>
  );
}
