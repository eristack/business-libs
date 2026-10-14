export type ProgressObserverState = {
  fetching: boolean;
  mutating: boolean;
  navigating: boolean;
};

export type ProgressObserver = {
  getState(): ProgressObserverState;
  setState(partial: Partial<ProgressObserverState>): void;
  subscribe(listener: () => void): () => void;
};

export function createProgressObserver(
  initial?: Partial<ProgressObserverState>,
): ProgressObserver {
  let state: ProgressObserverState = {
    fetching: initial?.fetching ?? false,
    mutating: initial?.mutating ?? false,
    navigating: initial?.navigating ?? false,
  };
  const listeners = new Set<() => void>();

  return {
    getState() {
      return state;
    },
    setState(partial) {
      state = { ...state, ...partial };
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
