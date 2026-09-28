export class IdempotencyConflictError extends Error {
  readonly code = "IDEMPOTENCY_CONFLICT" as const;

  constructor(readonly key: string) {
    super(`Idempotency key already in progress: ${key}`);
    this.name = "IdempotencyConflictError";
  }
}

export class IdempotencyRequestMismatchError extends Error {
  readonly code = "IDEMPOTENCY_REQUEST_MISMATCH" as const;

  constructor(readonly key: string) {
    super(`Idempotency key reused with different request body: ${key}`);
    this.name = "IdempotencyRequestMismatchError";
  }
}
