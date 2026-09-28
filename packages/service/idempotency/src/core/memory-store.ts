import type { IdempotencyRecord, IdempotencyStore } from "./types.js";

function isPendingActive(record: IdempotencyRecord, now: number) {
  return (
    record.state === "pending" &&
    (record.leaseExpiresAt == null || record.leaseExpiresAt > now)
  );
}

export function createMemoryIdempotencyStore(): IdempotencyStore {
  const records = new Map<string, IdempotencyRecord>();

  return {
    async get(key) {
      return records.get(key) ?? null;
    },
    async claim(input) {
      const now = Date.now();
      const existing = records.get(input.key);
      if (existing?.state === "completed") return false;
      if (existing && isPendingActive(existing, now)) return false;
      if (existing?.state === "failed" || (existing?.state === "pending" && !isPendingActive(existing, now))) {
        records.set(input.key, {
          state: "pending",
          requestHash: input.requestHash,
          leaseExpiresAt: now + (input.leaseMs ?? 60_000),
          createdAt: existing.createdAt,
        });
        return true;
      }
      records.set(input.key, {
        state: "pending",
        requestHash: input.requestHash,
        leaseExpiresAt: now + (input.leaseMs ?? 60_000),
        createdAt: now,
      });
      return true;
    },
    async complete(key, result) {
      const prev = records.get(key);
      records.set(key, {
        state: "completed",
        result,
        requestHash: prev?.requestHash,
        createdAt: prev?.createdAt ?? Date.now(),
      });
    },
    async fail(key, errorMessage) {
      const prev = records.get(key);
      records.set(key, {
        state: "failed",
        errorMessage,
        requestHash: prev?.requestHash,
        createdAt: prev?.createdAt ?? Date.now(),
      });
    },
  };
}
