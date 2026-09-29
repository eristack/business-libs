import { clampAddress, compareRaster, inBounds, sameAddress } from "./address.js";
import type {
  CellAddress,
  CellNavKind,
  GridDescriptor,
  MoveDirection,
  NavDirection,
  ResolvedSpreadsheetOperatorConfig,
  SpreadsheetOperatorConfig,
  TabDirection,
} from "./types.js";
import {
  DEFAULT_EDITABLE_KINDS,
  DEFAULT_NAVIGABLE_KINDS,
} from "./types.js";

export function resolveConfig(
  config: SpreadsheetOperatorConfig = {},
): ResolvedSpreadsheetOperatorConfig {
  return {
    wrap: config.wrap ?? "wrap",
    arrowWrap: config.arrowWrap ?? "stop",
    enterMove: config.enterMove ?? "down",
    typeToEdit: config.typeToEdit ?? true,
    navigableKinds: config.navigableKinds ?? DEFAULT_NAVIGABLE_KINDS,
    editableKinds: config.editableKinds ?? DEFAULT_EDITABLE_KINDS,
    arrowInEdit: config.arrowInEdit ?? "caret",
  };
}

export function kindAt(grid: GridDescriptor, address: CellAddress): CellNavKind | undefined {
  if (!inBounds(address, grid)) return undefined;
  return grid.cellAt(address).kind;
}

export function isKind(
  kind: CellNavKind | undefined,
  allowed: readonly CellNavKind[],
): boolean {
  return kind !== undefined && allowed.includes(kind);
}

export function isNavigable(
  grid: GridDescriptor,
  address: CellAddress,
  config: ResolvedSpreadsheetOperatorConfig,
): boolean {
  return isKind(kindAt(grid, address), config.navigableKinds);
}

export function isEditable(
  grid: GridDescriptor,
  address: CellAddress,
  config: ResolvedSpreadsheetOperatorConfig,
): boolean {
  return isKind(kindAt(grid, address), config.editableKinds);
}

export function listNavigableAddresses(
  grid: GridDescriptor,
  config: ResolvedSpreadsheetOperatorConfig,
): CellAddress[] {
  const out: CellAddress[] = [];
  for (let row = 0; row < grid.rowCount; row += 1) {
    for (let col = 0; col < grid.colCount; col += 1) {
      const address = { row, col };
      if (isNavigable(grid, address, config)) out.push(address);
    }
  }
  return out;
}

function step(address: CellAddress, direction: MoveDirection): CellAddress {
  switch (direction) {
    case "up":
      return { row: address.row - 1, col: address.col };
    case "down":
      return { row: address.row + 1, col: address.col };
    case "left":
      return { row: address.row, col: address.col - 1 };
    case "right":
      return { row: address.row, col: address.col + 1 };
  }
}

function wrapArrowStart(
  address: CellAddress,
  direction: MoveDirection,
  grid: GridDescriptor,
): CellAddress {
  switch (direction) {
    case "up":
      return { row: grid.rowCount - 1, col: address.col };
    case "down":
      return { row: 0, col: address.col };
    case "left":
      return { row: address.row, col: grid.colCount - 1 };
    case "right":
      return { row: address.row, col: 0 };
  }
}

export function moveActiveAddress(
  grid: GridDescriptor,
  from: CellAddress,
  direction: MoveDirection,
  config: ResolvedSpreadsheetOperatorConfig,
): CellAddress {
  if (grid.rowCount < 1 || grid.colCount < 1) return from;
  const origin = clampAddress(from, grid);
  let cursor = origin;
  const limit = Math.max(grid.rowCount, grid.colCount) + 1;
  for (let i = 0; i < limit; i += 1) {
    const next = step(cursor, direction);
    if (!inBounds(next, grid)) {
      if (config.arrowWrap === "stop") return origin;
      cursor = wrapArrowStart(origin, direction, grid);
    } else {
      cursor = next;
    }
    if (sameAddress(cursor, origin)) return origin;
    if (isNavigable(grid, cursor, config)) return cursor;
  }
  return origin;
}

function nextAfterRaster(
  list: CellAddress[],
  from: CellAddress,
  direction: TabDirection,
): CellAddress | undefined {
  if (direction === "next") {
    return list.find((cell) => compareRaster(cell, from) > 0);
  }
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const cell = list[i];
    if (cell && compareRaster(cell, from) < 0) return cell;
  }
  return undefined;
}

export function tabActiveAddress(
  grid: GridDescriptor,
  from: CellAddress,
  direction: TabDirection,
  config: ResolvedSpreadsheetOperatorConfig,
): CellAddress {
  const list = listNavigableAddresses(grid, config);
  if (list.length === 0) return from;
  const idx = list.findIndex((cell) => sameAddress(cell, from));
  if (idx === -1) {
    const found = nextAfterRaster(list, from, direction);
    if (found) return found;
    if (config.wrap === "wrap") {
      return direction === "next" ? (list[0] ?? from) : (list[list.length - 1] ?? from);
    }
    return from;
  }
  const delta = direction === "next" ? 1 : -1;
  const nextIdx = idx + delta;
  if (nextIdx >= 0 && nextIdx < list.length) {
    return list[nextIdx] ?? from;
  }
  if (config.wrap === "wrap") {
    return direction === "next" ? (list[0] ?? from) : (list[list.length - 1] ?? from);
  }
  return from;
}

export function getNextEditableAddress(
  grid: GridDescriptor,
  from: CellAddress,
  direction: NavDirection,
  config: SpreadsheetOperatorConfig = {},
): CellAddress | null {
  const resolved = resolveConfig(config);
  const origin = clampAddress(from, grid);
  if (direction === "next" || direction === "prev") {
    const next = tabActiveAddress(grid, origin, direction, resolved);
    return sameAddress(next, origin) && !isNavigable(grid, origin, resolved)
      ? null
      : next;
  }
  const next = moveActiveAddress(grid, origin, direction, resolved);
  if (sameAddress(next, origin) && !isNavigable(grid, origin, resolved)) {
    return isNavigable(grid, next, resolved) ? next : null;
  }
  return next;
}
