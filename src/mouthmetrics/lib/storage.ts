import type { ExerciseSession } from "../types/exercise";

const STORAGE_KEY = "mouthmetrics_sessions";

export function loadSessions(): ExerciseSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExerciseSession[];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ExerciseSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage may be unavailable
  }
}

export function addSession(session: ExerciseSession): ExerciseSession[] {
  const existing = loadSessions();
  const updated = [...existing, session];
  saveSessions(updated);
  return updated;
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
