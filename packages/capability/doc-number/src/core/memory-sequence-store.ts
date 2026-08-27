import type { AllocateNextInput, SequenceStore } from "./types.js";

import { normalizeScope } from "./scope.js";

function keyOf(input: AllocateNextInput): string {
  return `${input.formatId}\0${input.periodKey}\0${normalizeScope(input.scope)}`;
}

/** In-memory sequence store with a simple async mutex for allocateNext. */
export function createMemorySequenceStore(): SequenceStore {
  const values = new Map<string, number>();
  let chain: Promise<unknown> = Promise.resolve();

  function withLock<T>(fn: () => Promise<T> | T): Promise<T> {
    const run = chain.then(fn, fn);
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  return {
    allocateNext(input) {
      return withLock(() => {
        const key = keyOf(input);
        const next = (values.get(key) ?? 0) + 1;
        values.set(key, next);
        return next;
      });
    },

    async getCurrent(input) {
      const value = values.get(keyOf(input));
      return value === undefined ? null : value;
    },

    async peekNext(input) {
      return (values.get(keyOf(input)) ?? 0) + 1;
    },
  };
}
