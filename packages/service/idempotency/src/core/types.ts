export type IdempotencyRecordState = "pending" | "completed" | "failed";

export type IdempotencyRecord<T = unknown> = {
  state: IdempotencyRecordState;
  result?: T;
  errorMessage?: string;
  createdAt: number;
};

export interface IdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>;
  /** Atomically claim a key. False when pending or completed exists. */
  claim(key: string): Promise<boolean>;
  complete(key: string, result: unknown): Promise<void>;
  fail(key: string, errorMessage: string): Promise<void>;
}

export interface IdempotencyGuard {
  run<T>(key: string, fn: () => Promise<T>): Promise<T>;
}
