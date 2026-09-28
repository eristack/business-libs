import type { Outbox, OutboxHandlers, OutboxStore } from "./types.js";

export function createOutbox(store: OutboxStore): Outbox {
  return {
    enqueue(input) {
      return store.enqueue(input);
    },
    async processBatch(limit, handlers) {
      const batch = await store.claimBatch(limit);
      let processed = 0;
      for (const message of batch) {
        const handler = handlers[message.messageType];
        if (!handler) {
          await store.markFailed(message.id, `No handler for ${message.messageType}`);
          continue;
        }
        try {
          await handler(message);
          await store.markProcessed(message.id);
          processed += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await store.markFailed(message.id, msg);
        }
      }
      return processed;
    },
  };
}

export type { OutboxHandlers };
