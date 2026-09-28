import { IdempotencyConflictError, IdempotencyRequestMismatchError } from "./errors.js";
import { formatScopedIdempotencyKey } from "./scoped-key.js";
import type { IdempotencyGuardOptions, IdempotencyRecord, IdempotencyScope } from "./types.js";

function isPendingActive(record: IdempotencyRecord, now: number) {
  return (
    record.state === "pending" &&
    (record.leaseExpiresAt == null || record.leaseExpiresAt > now)
  );
}

async function waitForCompletion(
  store: IdempotencyGuardOptions["store"],
  storageKey: string,
  waitPollMs: number,
  maxWaitMs: number,
): Promise<IdempotencyRecord | null> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const row = await store.get(storageKey);
    if (!row) return null;
    if (row.state === "completed") return row;
    if (row.state === "failed") return row;
    if (row.state === "pending" && !isPendingActive(row, Date.now())) {
      return null;
    }
    await new Promise((r) => setTimeout(r, waitPollMs));
  }
  throw new IdempotencyConflictError(storageKey);
}

export async function runScopedIdempotency<T>(options: {
  store: IdempotencyGuardOptions["store"];
  scope: IdempotencyScope;
  key: string;
  requestHash: string;
  leaseMs?: number;
  waitPollMs?: number;
  defaultLeaseMs?: number;
  waitOnPending?: boolean;
  fn: () => Promise<T>;
}): Promise<T> {
  const storageKey = formatScopedIdempotencyKey(options.scope, options.key);
  const leaseMs = options.leaseMs ?? options.defaultLeaseMs ?? 60_000;
  const waitPollMs = options.waitPollMs ?? 50;
  const waitOnPending = options.waitOnPending ?? true;

  const existing = await options.store.get(storageKey);
  if (existing?.state === "completed") {
    if (existing.requestHash && existing.requestHash !== options.requestHash) {
      throw new IdempotencyRequestMismatchError(storageKey);
    }
    return existing.result as T;
  }
  if (existing && isPendingActive(existing, Date.now())) {
    if (!waitOnPending) {
      throw new IdempotencyConflictError(storageKey);
    }
    const waited = await waitForCompletion(
      options.store,
      storageKey,
      waitPollMs,
      leaseMs,
    );
    if (waited?.state === "completed") {
      if (waited.requestHash && waited.requestHash !== options.requestHash) {
        throw new IdempotencyRequestMismatchError(storageKey);
      }
      return waited.result as T;
    }
    throw new IdempotencyConflictError(storageKey);
  }

  const claimed = await options.store.claim({
    key: storageKey,
    requestHash: options.requestHash,
    leaseMs,
  });
  if (!claimed) {
    const again = await options.store.get(storageKey);
    if (again?.state === "completed") {
      if (again.requestHash && again.requestHash !== options.requestHash) {
        throw new IdempotencyRequestMismatchError(storageKey);
      }
      return again.result as T;
    }
    throw new IdempotencyConflictError(storageKey);
  }

  try {
    const result = await options.fn();
    await options.store.complete(storageKey, result);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await options.store.fail(storageKey, message);
    throw err;
  }
}
