import type { BackseatStore } from "@eristack/backseat";
import type { BumpEpochInput, EpochScope, EpochStore, EpochValue } from "../core/types.js";
import { StaleEpochError } from "../core/errors.js";
import { EPOCH_COLLECTIONS, counterDocId } from "./collections.js";

type CounterDoc = {
  id: string;
  scope: string;
  value: number;
  updatedAt?: string | null;
};

export function createBackseatEpochStore(
  store: BackseatStore,
  collections: Partial<typeof EPOCH_COLLECTIONS> = {},
): EpochStore {
  const cols = { ...EPOCH_COLLECTIONS, ...collections };

  async function read(scope: EpochScope): Promise<EpochValue> {
    const doc = (await store.get(cols.counters, counterDocId(scope))) as
      | CounterDoc
      | null;
    return doc?.value ?? 0;
  }

  return {
    get: read,

    async getMany(scopes) {
      const out: Record<EpochScope, EpochValue> = {};
      for (const scope of scopes) {
        out[scope] = await read(scope);
      }
      return out;
    },

    async bump(scope, input: BumpEpochInput = {}) {
      const by = input.by ?? 1;
      const current = await read(scope);
      if (input.expected !== undefined && input.expected !== current) {
        throw new StaleEpochError(scope, input.expected, current);
      }
      const next = current + by;
      const doc: CounterDoc = {
        id: counterDocId(scope),
        scope,
        value: next,
        updatedAt: new Date().toISOString(),
      };
      const existing = await store.get(cols.counters, doc.id);
      if (existing) {
        await store.update(cols.counters, doc.id, doc);
      } else {
        await store.create(cols.counters, doc);
      }
      return next;
    },
  };
}
