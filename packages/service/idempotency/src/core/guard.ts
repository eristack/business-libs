import { IdempotencyConflictError } from "./errors.js";
import type { IdempotencyGuard, IdempotencyStore } from "./types.js";

export function createIdempotencyGuard(store: IdempotencyStore): IdempotencyGuard {
  return {
    async run<T>(key: string, fn: () => Promise<T>): Promise<T> {
      const existing = await store.get(key);
      if (existing?.state === "completed") {
        return existing.result as T;
      }
      if (existing?.state === "pending") {
        throw new IdempotencyConflictError(key);
      }

      const claimed = await store.claim(key);
      if (!claimed) {
        const again = await store.get(key);
        if (again?.state === "completed") return again.result as T;
        throw new IdempotencyConflictError(key);
      }

      try {
        const result = await fn();
        await store.complete(key, result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await store.fail(key, message);
        throw err;
      }
    },
  };
}
