import { useCallback, useState } from "react";
import type { ChildProfile, PracticeSession } from "../types";
import {
  addSession as storageAdd,
  loadChild,
  loadSessions,
  saveChild,
  saveSessions,
} from "../lib/storage";

export function useSessions() {
  const [child, setChildState] = useState<ChildProfile | null>(loadChild);
  const [sessions, setSessions] = useState<PracticeSession[]>(loadSessions);

  const saveChildProfile = useCallback((profile: ChildProfile) => {
    saveChild(profile);
    setChildState(profile);
  }, []);

  const addSession = useCallback((session: PracticeSession) => {
    const updated = storageAdd(session);
    setSessions(updated);
  }, []);

  const clearData = useCallback(() => {
    saveSessions([]);
    setSessions([]);
  }, []);

  return { child, sessions, saveChildProfile, addSession, clearData };
}
