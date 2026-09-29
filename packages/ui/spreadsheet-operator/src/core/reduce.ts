import { clampAddress, sameAddress } from "./address.js";
import { isEditable, moveActiveAddress, tabActiveAddress } from "./navigation.js";
import type {
  CellAddress,
  GridDescriptor,
  GridId,
  OperatorAction,
  OperatorContext,
  OperatorEffect,
  SpreadsheetOperatorState,
} from "./types.js";

function fieldKeyAt(grid: GridDescriptor, address: CellAddress): string | undefined {
  const cell = grid.cellAt(address);
  return cell.fieldKey ?? cell.id;
}

function commitEffect(
  gridId: GridId,
  address: CellAddress,
  ctx: OperatorContext,
): OperatorEffect {
  const grid = ctx.grids.get(gridId);
  return {
    type: "commit",
    gridId,
    address,
    fieldKey: grid ? fieldKeyAt(grid, address) : undefined,
    phase: "commit",
  };
}

function cancelEffect(gridId: GridId, address: CellAddress): OperatorEffect {
  return { type: "cancel", gridId, address, phase: "cancel" };
}

function startEditEffect(
  gridId: GridId,
  address: CellAddress,
  seed?: string,
): OperatorEffect {
  return { type: "startEdit", gridId, address, seed };
}

function gridOf(
  ctx: OperatorContext,
  gridId: GridId,
): GridDescriptor | undefined {
  return ctx.grids.get(gridId);
}

function editingOf(
  state: SpreadsheetOperatorState,
): Extract<SpreadsheetOperatorState, { mode: "editing" }> | undefined {
  return state.mode === "editing" ? state : undefined;
}

function positionedOf(
  state: SpreadsheetOperatorState,
): Extract<SpreadsheetOperatorState, { mode: "active" | "editing" }> | undefined {
  return state.mode === "inactive" ? undefined : state;
}

function commitIfEditing(
  state: SpreadsheetOperatorState,
  ctx: OperatorContext,
): OperatorEffect[] {
  const editing = editingOf(state);
  if (!editing) return [];
  return [commitEffect(editing.gridId, editing.address, ctx)];
}

function enterMoveAddress(
  grid: GridDescriptor,
  from: CellAddress,
  ctx: OperatorContext,
): CellAddress {
  if (ctx.config.enterMove === "none") return from;
  const direction = ctx.config.enterMove === "right" ? "right" : "down";
  return moveActiveAddress(grid, from, direction, ctx.config);
}

export function reduceOperator(
  state: SpreadsheetOperatorState,
  action: OperatorAction,
  ctx: OperatorContext,
): { state: SpreadsheetOperatorState; effects: OperatorEffect[] } {
  switch (action.type) {
    case "activate": {
      const grid = gridOf(ctx, action.gridId);
      if (!grid || grid.rowCount < 1 || grid.colCount < 1) {
        return { state, effects: [] };
      }
      const address = clampAddress(action.address, grid);
      const effects = commitIfEditing(state, ctx);
      const next: SpreadsheetOperatorState = {
        mode: "active",
        gridId: action.gridId,
        address,
      };
      if (
        state.mode === "active" &&
        state.gridId === next.gridId &&
        sameAddress(state.address, next.address) &&
        effects.length === 0
      ) {
        return { state, effects: [] };
      }
      return { state: next, effects };
    }
    case "deactivate": {
      if (state.mode === "inactive") return { state, effects: [] };
      return { state: { mode: "inactive" }, effects: commitIfEditing(state, ctx) };
    }
    case "move": {
      const pos = positionedOf(state);
      if (!pos) return { state, effects: [] };
      if (state.mode === "editing" && ctx.config.arrowInEdit === "caret") {
        return { state, effects: [] };
      }
      const grid = gridOf(ctx, pos.gridId);
      if (!grid) return { state, effects: [] };
      const effects = commitIfEditing(state, ctx);
      const address = moveActiveAddress(grid, pos.address, action.direction, ctx.config);
      return {
        state: { mode: "active", gridId: pos.gridId, address },
        effects,
      };
    }
    case "tab": {
      const pos = positionedOf(state);
      if (!pos) return { state, effects: [] };
      const grid = gridOf(ctx, pos.gridId);
      if (!grid) return { state, effects: [] };
      const effects = commitIfEditing(state, ctx);
      const address = tabActiveAddress(
        grid,
        pos.address,
        action.shift ? "prev" : "next",
        ctx.config,
      );
      return {
        state: { mode: "active", gridId: pos.gridId, address },
        effects,
      };
    }
    case "enter": {
      if (state.mode === "inactive") return { state, effects: [] };
      const grid = gridOf(ctx, state.gridId);
      if (!grid) return { state, effects: [] };
      if (state.mode === "active") {
        if (!isEditable(grid, state.address, ctx.config)) {
          return { state, effects: [] };
        }
        return {
          state: { mode: "editing", gridId: state.gridId, address: state.address },
          effects: [startEditEffect(state.gridId, state.address)],
        };
      }
      const address = enterMoveAddress(grid, state.address, ctx);
      return {
        state: { mode: "active", gridId: state.gridId, address },
        effects: [commitEffect(state.gridId, state.address, ctx)],
      };
    }
    case "escape": {
      if (state.mode === "inactive") return { state, effects: [] };
      if (state.mode === "editing") {
        return {
          state: { mode: "active", gridId: state.gridId, address: state.address },
          effects: [cancelEffect(state.gridId, state.address)],
        };
      }
      return { state: { mode: "inactive" }, effects: [] };
    }
    case "f2": {
      if (state.mode !== "active") return { state, effects: [] };
      const grid = gridOf(ctx, state.gridId);
      if (!grid || !isEditable(grid, state.address, ctx.config)) {
        return { state, effects: [] };
      }
      return {
        state: { mode: "editing", gridId: state.gridId, address: state.address },
        effects: [startEditEffect(state.gridId, state.address)],
      };
    }
    case "type": {
      if (!ctx.config.typeToEdit) return { state, effects: [] };
      if (state.mode !== "active") return { state, effects: [] };
      const grid = gridOf(ctx, state.gridId);
      if (!grid || !isEditable(grid, state.address, ctx.config)) {
        return { state, effects: [] };
      }
      return {
        state: {
          mode: "editing",
          gridId: state.gridId,
          address: state.address,
          seed: action.char,
        },
        effects: [startEditEffect(state.gridId, state.address, action.char)],
      };
    }
    case "commit": {
      if (state.mode !== "editing") return { state, effects: [] };
      return {
        state: { mode: "active", gridId: state.gridId, address: state.address },
        effects: [commitEffect(state.gridId, state.address, ctx)],
      };
    }
    case "cancel": {
      if (state.mode !== "editing") return { state, effects: [] };
      return {
        state: { mode: "active", gridId: state.gridId, address: state.address },
        effects: [cancelEffect(state.gridId, state.address)],
      };
    }
  }
}
