const KEY = "example.react.currentSessionId";

export function getCurrentSessionId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setCurrentSessionId(sessionId: string | null): void {
  try {
    if (sessionId == null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, sessionId);
  } catch {
    /* ignore quota / private mode */
  }
}
