import { useCallback, useState } from "react";
import { WelcomePage } from "./pages/WelcomePage";
import { ChildSetupPage } from "./pages/ChildSetupPage";
import { TargetSelectionPage } from "./pages/TargetSelectionPage";
import { PracticePage } from "./pages/PracticePage";
import { SessionCompletePage } from "./pages/SessionCompletePage";
import { ParentDashboardPage } from "./pages/ParentDashboardPage";
import { ClinicianSummaryPage } from "./pages/ClinicianSummaryPage";
import { useSessions } from "./hooks/useSessions";
import { saveSessions } from "./lib/storage";
import type { AppPage, ChildProfile, PracticeSession, SpeechTarget } from "./types";

// Demo seed data for the demo mode flow
function makeDemoSession(target: SpeechTarget, child: ChildProfile): PracticeSession {
  const now = Date.now();
  return {
    id: "demo-session-1",
    childId: child.id,
    targetId: target.id,
    targetLabel: target.label,
    targetIpa: target.ipa,
    startedAt: new Date(now - 420000).toISOString(),
    completedAt: new Date(now - 120000).toISOString(),
    attempts: Array.from({ length: 5 }, (_, i) => ({
      id: `demo-attempt-${i}`,
      attemptNumber: i + 1,
      targetLabel: target.label,
      audioAttemptDetected: true,
      visualScore: target.feedbackMode !== "audio_only" ? 52 + i * 8 : undefined,
      holdDurationMs: target.feedbackMode !== "audio_only" ? 1800 + i * 400 : undefined,
      stabilityScore: target.feedbackMode !== "audio_only" ? 65 + i * 5 : undefined,
      symmetryScore: target.feedbackMode !== "audio_only" ? 80 + i * 2 : undefined,
      completed: true,
      feedback: "Nice effort! Your plant is growing!",
    })),
    rewardsEarned: 5,
    plantStage: 4,
    parentDifficultyRating: "okay",
    parentNote: "Practice was easier when done after dinner.",
  };
}

export function App() {
  const [page, setPage] = useState<AppPage>("landing");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SpeechTarget | null>(null);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);

  const { child, sessions, saveChildProfile, addSession, clearData } = useSessions();

  const handleStart = useCallback(() => {
    setIsDemoMode(false);
    if (child) {
      setPage("target-select");
    } else {
      setPage("child-setup");
    }
  }, [child]);

  const handleDemo = useCallback(() => {
    setIsDemoMode(true);
    if (child) {
      setPage("target-select");
    } else {
      setPage("child-setup");
    }
  }, [child]);

  const handleChildSetup = useCallback(
    (profile: ChildProfile) => {
      saveChildProfile(profile);
      setPage("target-select");
    },
    [saveChildProfile]
  );

  const handleSelectTarget = useCallback((target: SpeechTarget) => {
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
      // Update in storage by replacing the last session
      // The session is already saved; we just update parent data
      const newSessions = sessions.map((s) => (s.id === updated.id ? updated : s));
      saveSessions(newSessions);
      setCurrentSession(updated);
    },
    [sessions]
  );

  const handleDemoFlow = useCallback(() => {
    if (!selectedTarget || !child) return;
    const demo = makeDemoSession(selectedTarget, child);
    addSession(demo);
    setCurrentSession(demo);
    setPage("session-complete");
  }, [selectedTarget, child, addSession]);

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

      {page === "target-select" && child && (
        <TargetSelectionPage
          child={child}
          onSelect={handleSelectTarget}
          onBack={() => setPage(child ? "landing" : "child-setup")}
        />
      )}

      {page === "practice" && child && selectedTarget && (
        <PracticePage
          key={selectedTarget.id + String(isDemoMode)}
          child={child}
          target={selectedTarget}
          isDemoMode={isDemoMode}
          onComplete={handleSessionComplete}
          onExit={() => setPage("target-select")}
        />
      )}

      {page === "session-complete" && currentSession && (
        <SessionCompletePage
          session={currentSession}
          onUpdateSession={handleUpdateSession}
          onViewDashboard={() => setPage("parent-dashboard")}
          onPracticeAgain={() => setPage("target-select")}
        />
      )}

      {page === "parent-dashboard" && child && (
        <ParentDashboardPage
          child={child}
          sessions={sessions}
          onClinicianSummary={() => setPage("clinician-summary")}
          onPractice={() => setPage("target-select")}
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
