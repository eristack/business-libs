export class OutboxDuplicateKeyError extends Error {
  readonly code = "OUTBOX_DUPLICATE_KEY" as const;

  constructor(idempotencyKey: string) {
    super(`Outbox idempotency key already enqueued: ${idempotencyKey}`);
    this.name = "OutboxDuplicateKeyError";
  }
}
