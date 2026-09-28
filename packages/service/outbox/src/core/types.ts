export type OutboxMessageStatus = "pending" | "processing" | "processed" | "failed";

export type OutboxMessage = {
  id: string;
  aggregateType: string;
  aggregateId: string;
  messageType: string;
  payloadJson: string;
  idempotencyKey: string;
  status: OutboxMessageStatus;
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type EnqueueOutboxInput = {
  id: string;
  aggregateType: string;
  aggregateId: string;
  messageType: string;
  payloadJson: string;
  idempotencyKey: string;
};

export type OutboxStore = {
  enqueue(input: EnqueueOutboxInput): Promise<OutboxMessage>;
  findByIdempotencyKey(idempotencyKey: string): Promise<OutboxMessage | null>;
  claimBatch(limit: number): Promise<OutboxMessage[]>;
  markProcessed(id: string): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
};

export type OutboxHandlers = Record<
  string,
  (message: OutboxMessage) => Promise<void>
>;

export type Outbox = {
  enqueue(input: EnqueueOutboxInput): Promise<OutboxMessage>;
  processBatch(limit: number, handlers: OutboxHandlers): Promise<number>;
};
