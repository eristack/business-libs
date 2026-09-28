export type IdempotencyRecordState = "pending" | "completed" | "failed";

export type IdempotencyScope = {
  tenantId?: string;
  /** Route or use-case id, e.g. `POST /api/purchase-orders`. */
  scope: string;
};

export type IdempotencyRecord<T = unknown> = {
  state: IdempotencyRecordState;
  result?: T;
  errorMessage?: string;
  requestHash?: string;
  leaseExpiresAt?: number;
  createdAt: number;
};

export type IdempotencyClaimInput = {
  key: string;
  requestHash: string;
  leaseMs?: number;
};

export interface IdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>;
  /** Atomically claim a key. False when pending (unexpired) or completed exists. */
  claim(input: IdempotencyClaimInput): Promise<boolean>;
  complete(key: string, result: unknown): Promise<void>;
  fail(key: string, errorMessage: string): Promise<void>;
}

export interface IdempotencyGuard {
  run<T>(key: string, fn: () => Promise<T>): Promise<T>;
  runScoped<T>(input: {
    scope: IdempotencyScope;
    key: string;
    requestHash: string;
    leaseMs?: number;
    fn: () => Promise<T>;
  }): Promise<T>;
}

export type IdempotencyGuardOptions = {
  store: IdempotencyStore;
  /** Poll interval when waiting on another holder's lease. */
  waitPollMs?: number;
  defaultLeaseMs?: number;
  /** When false, duplicate requests while pending throw immediately (no poll). */
  waitOnPending?: boolean;
};
