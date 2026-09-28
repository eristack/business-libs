import { hashIdempotencyRequest } from "./request-hash.js";
import { runScopedIdempotency } from "./guard-scoped.js";
import type { IdempotencyGuard, IdempotencyGuardOptions } from "./types.js";

export function createIdempotencyGuard(
  storeOrOptions: IdempotencyGuardOptions["store"] | IdempotencyGuardOptions,
): IdempotencyGuard {
  const options: IdempotencyGuardOptions =
    "get" in storeOrOptions
      ? { store: storeOrOptions }
      : storeOrOptions;

  return {
    async run<T>(key: string, fn: () => Promise<T>): Promise<T> {
      const requestHash = await hashIdempotencyRequest(null);
      return runScopedIdempotency({
        ...options,
        scope: { scope: "default" },
        key,
        requestHash,
        fn,
      });
    },
    runScoped(input) {
      return runScopedIdempotency({ ...options, ...input });
    },
  };
}
