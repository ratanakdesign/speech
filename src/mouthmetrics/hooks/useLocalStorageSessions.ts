import { useState, useCallback } from "react";
import { loadSessions, addSession as addToStorage, clearSessions as clearFromStorage } from "../lib/storage";
import type { ExerciseSession } from "../types/exercise";

export function useLocalStorageSessions() {
  const [sessions, setSessions] = useState<ExerciseSession[]>(() => loadSessions());

  const addSession = useCallback((session: ExerciseSession) => {
    const updated = addToStorage(session);
    setSessions(updated);
  }, []);

  const clearSessions = useCallback(() => {
    clearFromStorage();
    setSessions([]);
  }, []);

  const refresh = useCallback(() => {
    setSessions(loadSessions());
  }, []);

  return { sessions, addSession, clearSessions, refresh };
}
