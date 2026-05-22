import React, { useCallback, useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { ExerciseSelectionPage } from "./pages/ExerciseSelectionPage";
import { PracticePage } from "./pages/PracticePage";
import { ResultsPage } from "./pages/ResultsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TherapistSummaryPage } from "./pages/TherapistSummaryPage";
import { useLocalStorageSessions } from "./hooks/useLocalStorageSessions";
import type { AppPage, ExerciseDefinition, ExerciseSession } from "./types/exercise";

export function MouthMetricsApp() {
  const [page, setPage] = useState<AppPage>("landing");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);
  const [currentSession, setCurrentSession] = useState<ExerciseSession | null>(null);
  const [practiceKey, setPracticeKey] = useState(0);

  const { sessions, addSession, clearSessions } = useLocalStorageSessions();

  const handleStart = useCallback(() => {
    setPage("exercise-select");
  }, []);

  const handleSelectExercise = useCallback((exercise: ExerciseDefinition) => {
    setSelectedExercise(exercise);
    setPracticeKey((k) => k + 1);
    setPage("practice");
  }, []);

  const handleSessionComplete = useCallback(
    (session: ExerciseSession) => {
      addSession(session);
      setCurrentSession(session);
      setPage("results");
    },
    [addSession]
  );

  const handleRepeat = useCallback(() => {
    if (!selectedExercise) return;
    setPracticeKey((k) => k + 1);
    setPage("practice");
  }, [selectedExercise]);

  const handleClearData = useCallback(() => {
    clearSessions();
  }, [clearSessions]);

  return (
    <div className="font-sans">
      {page === "landing" && (
        <LandingPage
          onStart={handleStart}
          onDashboard={() => setPage("dashboard")}
          sessionCount={sessions.length}
        />
      )}

      {page === "exercise-select" && (
        <ExerciseSelectionPage
          onSelect={handleSelectExercise}
          onBack={() => setPage("landing")}
          sessions={sessions}
        />
      )}

      {page === "practice" && selectedExercise && (
        <PracticePage
          key={practiceKey}
          exercise={selectedExercise}
          onComplete={handleSessionComplete}
          onBack={() => setPage("exercise-select")}
        />
      )}

      {page === "results" && currentSession && (
        <ResultsPage
          session={currentSession}
          onDashboard={() => setPage("dashboard")}
          onRepeat={handleRepeat}
        />
      )}

      {page === "dashboard" && (
        <DashboardPage
          sessions={sessions}
          onStartPractice={() => setPage("exercise-select")}
          onTherapistSummary={() => setPage("therapist-summary")}
          onClearData={handleClearData}
          onBack={() => setPage("landing")}
        />
      )}

      {page === "therapist-summary" && (
        <TherapistSummaryPage
          sessions={sessions}
          onBack={() => setPage("dashboard")}
        />
      )}
    </div>
  );
}
