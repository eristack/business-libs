import type { BackseatStore } from "@eristack/backseat";
import type { AllocateNextInput, SequenceStore } from "../core/types.js";
import { normalizeScope } from "../core/scope.js";
import { DOC_NUMBER_COLLECTIONS, sequenceDocId } from "./collections.js";

export function createBackseatSequenceStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): SequenceStore {
  const collection = options.collection ?? DOC_NUMBER_COLLECTIONS.sequences;
  let chain: Promise<unknown> = Promise.resolve();

  function withLock<T>(fn: () => Promise<T> | T): Promise<T> {
    const run = chain.then(fn, fn);
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function readValue(input: AllocateNextInput): Promise<number | null> {
    const id = sequenceDocId(input.formatId, input.periodKey, input.scope);
    const doc = await store.get(collection, id);
    if (!doc) return null;
    return Number(doc.value);
  }

  return {
    allocateNext(input) {
      return withLock(async () => {
        const id = sequenceDocId(input.formatId, input.periodKey, input.scope);
        const current = (await readValue(input)) ?? 0;
        const next = current + 1;
        const doc = {
          id,
          formatId: input.formatId,
          periodKey: input.periodKey,
          scope: normalizeScope(input.scope),
          value: next,
        };
        const existing = await store.get(collection, id);
        if (existing) {
          await store.update(collection, id, doc);
        } else {
          await store.create(collection, doc);
        }
        return next;
      });
    },

    async getCurrent(input) {
      return readValue(input);
    },

    async peekNext(input) {
      return ((await readValue(input)) ?? 0) + 1;
    },
  };
}
