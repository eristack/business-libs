export type BusyState = {
  depth: number;
  label?: string;
};

export type BusyHandle = {
  run<T>(work: () => Promise<T>, label?: string): Promise<T>;
  getState(): BusyState;
  isBusy(): boolean;
  subscribe(listener: () => void): () => void;
};

export function createBusy(): BusyHandle {
  let depth = 0;
  let label: string | undefined;
  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of listeners) listener();
  }

  return {
    getState() {
      return { depth, label };
    },
    isBusy() {
      return depth > 0;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async run(work, runLabel) {
      depth += 1;
      if (runLabel !== undefined) {
        label = runLabel;
      }
      notify();
      try {
        return await work();
      } finally {
        depth -= 1;
        if (depth === 0) {
          label = undefined;
        }
        notify();
      }
    },
  };
}
