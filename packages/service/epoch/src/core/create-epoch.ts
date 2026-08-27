import { compareEpochs } from "./compare.js";
import { InvalidEpochInputError, StaleEpochError } from "./errors.js";
import type {
  BumpEpochInput,
  Epoch,
  EpochConfig,
  EpochScope,
  EpochValue,
} from "./types.js";

export function createEpoch(config: EpochConfig): Epoch {
  const store = config.store;
  const defaultIncrement = config.defaultIncrement ?? 1;

  function normalizeBump(input: BumpEpochInput = {}): BumpEpochInput {
    const by = input.by ?? defaultIncrement;
    if (!Number.isInteger(by) || by < 1) {
      throw new InvalidEpochInputError("bump `by` must be a positive integer");
    }
    return { ...input, by };
  }

  return {
    compare: compareEpochs,

    current(scope) {
      return store.get(scope);
    },

    currentMany(scopes) {
      return store.getMany(scopes);
    },

    async bump(scope, input) {
      return store.bump(scope, normalizeBump(input));
    },

    async bumpMany(scopes, input) {
      if (scopes.length === 0) return;
      const normalized = normalizeBump(input);
      await Promise.all(scopes.map((scope) => store.bump(scope, normalized)));
    },

    async resolveCachePolicy(scope, clientEpoch) {
      const current = await store.get(scope);
      return {
        scope,
        clientEpoch,
        current,
        policy: compareEpochs(clientEpoch, current),
      };
    },

    async resolveCachePolicyMany(input) {
      const scopes = Object.keys(input);
      const currents = await store.getMany(scopes);
      return scopes.map((scope) => ({
        scope,
        clientEpoch: input[scope] ?? 0,
        current: currents[scope] ?? 0,
        policy: compareEpochs(input[scope] ?? 0, currents[scope] ?? 0),
      }));
    },

    async assertFresh(scope, clientEpoch) {
      const current = await store.get(scope);
      if (clientEpoch !== current) {
        throw new StaleEpochError(scope, clientEpoch, current);
      }
      return current;
    },
  };
}

export type { EpochScope, EpochValue };
