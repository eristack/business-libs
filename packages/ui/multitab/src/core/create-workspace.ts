import { multitabReducer } from "./state.js";
import type { MultitabAction, MultitabState } from "./types.js";
import { initialMultitabState } from "./state.js";

export type TabWorkspace = {
  getState(): MultitabState;
  dispatch(action: MultitabAction): void;
  subscribe(listener: () => void): () => void;
};

export function createTabWorkspace(options?: {
  initialState?: MultitabState;
}): TabWorkspace {
  let state = options?.initialState ?? initialMultitabState;
  const listeners = new Set<() => void>();

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = multitabReducer(state, action);
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
