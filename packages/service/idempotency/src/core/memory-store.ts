import type { IdempotencyRecord, IdempotencyStore } from "./types.js";

export function createMemoryIdempotencyStore(): IdempotencyStore {
  const records = new Map<string, IdempotencyRecord>();

  return {
    async get(key) {
      return records.get(key) ?? null;
    },
    async claim(key) {
      const existing = records.get(key);
      if (existing && (existing.state === "pending" || existing.state === "completed")) {
        return false;
      }
      records.set(key, { state: "pending", createdAt: Date.now() });
      return true;
    },
    async complete(key, result) {
      records.set(key, {
        state: "completed",
        result,
        createdAt: records.get(key)?.createdAt ?? Date.now(),
      });
    },
    async fail(key, errorMessage) {
      records.set(key, {
        state: "failed",
        errorMessage,
        createdAt: records.get(key)?.createdAt ?? Date.now(),
      });
    },
  };
}
