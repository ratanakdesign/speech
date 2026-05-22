import type { ChildProfile, PracticeSession } from "../types";

const KEYS = {
  child: "ss_child_profile",
  sessions: "ss_sessions",
};

export function saveChild(child: ChildProfile): void {
  localStorage.setItem(KEYS.child, JSON.stringify(child));
}

export function loadChild(): ChildProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.child);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSessions(sessions: PracticeSession[]): void {
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}

export function loadSessions(): PracticeSession[] {
  try {
    const raw = localStorage.getItem(KEYS.sessions);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAll(): void {
  localStorage.removeItem(KEYS.child);
  localStorage.removeItem(KEYS.sessions);
}

export function addSession(session: PracticeSession): PracticeSession[] {
  const existing = loadSessions();
  const updated = [...existing, session];
  saveSessions(updated);
  return updated;
}
