import { useCallback, useState } from "react";
import { WelcomePage } from "./pages/WelcomePage";
import { ChildSetupPage } from "./pages/ChildSetupPage";
import { LearningMapPage } from "./pages/LearningMapPage";
import { ModuleIntroPage } from "./pages/ModuleIntroPage";
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
    if (child) {
      setPage("map");
    } else {
      setPage("child-setup");
    }
  }, [child]);

  const handleDemo = useCallback(() => {
    setIsDemoMode(true);
    if (child) {
      setPage("map");
    } else {
      setPage("child-setup");
    }
  }, [child]);

  const handleChildSetup = useCallback(
    (profile: ChildProfile) => {
      saveChildProfile({ ...profile, hasCompletedSetup: true });
      setPage("map");
    },
    [saveChildProfile]
  );

  const handleSelectModule = useCallback((m: MapModule) => {
    const target = getTargetById(m.targetId);
    if (!target) return;
    setSelectedModule(m);
    setSelectedTarget(target);
    setPage("module-intro");
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
    <>
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

      {page === "module-intro" && selectedModule && selectedTarget && child && (
        <ModuleIntroPage
          module={selectedModule}
          target={selectedTarget}
          child={child}
          onStartPractice={() => setPage("practice")}
          onSeeTheSound={() => setPage("see-the-sound")}
          onBack={() => setPage("map")}
        />
      )}

      {page === "see-the-sound" && selectedTarget && (
        <SeeTheSoundPage
          target={selectedTarget}
          onStartPractice={() => setPage("practice")}
          onBack={() => setPage("module-intro")}
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
          onBack={() => setPage("landing")}
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
    </>
  );
}
