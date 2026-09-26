import type { OAuthPendingLogin, OAuthPendingLoginStore } from "./types.js";

/** Unit tests only — production uses Drizzle. */
export function createMemoryOAuthPendingStore(): OAuthPendingLoginStore {
  const map = new Map<string, OAuthPendingLogin>();

  return {
    async save(pending) {
      map.set(pending.state, pending);
    },
    async consume(state) {
      const row = map.get(state);
      if (!row) return null;
      map.delete(state);
      if (new Date(row.expiresAt).getTime() < Date.now()) return null;
      return row;
    },
  };
}
