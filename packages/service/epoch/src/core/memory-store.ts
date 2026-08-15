import { InvalidEpochInputError, StaleEpochError } from "./errors.js";
import type { EpochScope, EpochStore, EpochValue } from "./types.js";

type CounterRow = { value: EpochValue; updatedAt: string };

/** In-memory EpochStore — unit tests and ephemeral demos only. */
export function createMemoryEpochStore(): EpochStore {
  const counters = new Map<EpochScope, CounterRow>();

  function read(scope: EpochScope): EpochValue {
    return counters.get(scope)?.value ?? 0;
  }

  return {
    async get(scope) {
      return read(scope);
    },

    async getMany(scopes) {
      const out: Record<EpochScope, EpochValue> = {};
      for (const scope of scopes) {
        out[scope] = read(scope);
      }
      return out;
    },

    async bump(scope, input = {}) {
      const by = input.by ?? 1;
      if (!Number.isInteger(by) || by < 1) {
        throw new InvalidEpochInputError("bump `by` must be a positive integer");
      }
      const current = read(scope);
      if (input.expected !== undefined && input.expected !== current) {
        throw new StaleEpochError(scope, input.expected, current);
      }
      const next = current + by;
      counters.set(scope, { value: next, updatedAt: new Date().toISOString() });
      return next;
    },
  };
}
