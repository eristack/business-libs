import { keyEventToAction } from "./keymap.js";
import { resolveConfig } from "./navigation.js";
import { reduceOperator } from "./reduce.js";
import type {
  GridDescriptor,
  GridId,
  OperatorAction,
  OperatorEffect,
  OperatorKeyEvent,
  SpreadsheetOperatorConfig,
  SpreadsheetOperatorListener,
  SpreadsheetOperatorState,
} from "./types.js";

export type SpreadsheetOperator = {
  getState(): SpreadsheetOperatorState;
  dispatch(action: OperatorAction): {
    state: SpreadsheetOperatorState;
    effects: readonly OperatorEffect[];
  };
  handleKeyDown(event: OperatorKeyEvent): boolean;
  registerGrid(descriptor: GridDescriptor): void;
  unregisterGrid(gridId: GridId): void;
  getGrid(gridId: GridId): GridDescriptor | undefined;
  subscribe(listener: SpreadsheetOperatorListener): () => void;
};

export function createSpreadsheetOperator(
  config: SpreadsheetOperatorConfig = {},
): SpreadsheetOperator {
  const resolved = resolveConfig(config);
  let state: SpreadsheetOperatorState = { mode: "inactive" };
  const grids = new Map<GridId, GridDescriptor>();
  const listeners = new Set<SpreadsheetOperatorListener>();

  function notify(effects: readonly OperatorEffect[]): void {
    for (const listener of listeners) listener(state, effects);
  }

  function dispatch(action: OperatorAction): {
    state: SpreadsheetOperatorState;
    effects: readonly OperatorEffect[];
  } {
    const result = reduceOperator(state, action, { grids, config: resolved });
    if (result.state === state && result.effects.length === 0) {
      return result;
    }
    state = result.state;
    notify(result.effects);
    return result;
  }

  return {
    getState() {
      return state;
    },
    dispatch,
    handleKeyDown(event) {
      const action = keyEventToAction(state, event, resolved);
      if (!action) return false;
      const before = state;
      const result = dispatch(action);
      return result.state !== before || result.effects.length > 0;
    },
    registerGrid(descriptor) {
      grids.set(descriptor.id, descriptor);
    },
    unregisterGrid(gridId) {
      const active = state.mode !== "inactive" && state.gridId === gridId;
      if (active) dispatch({ type: "deactivate" });
      grids.delete(gridId);
    },
    getGrid(gridId) {
      return grids.get(gridId);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
