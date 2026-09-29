import type { CellAddress, GridDescriptor } from "./types.js";

export function sameAddress(a: CellAddress, b: CellAddress): boolean {
  return a.row === b.row && a.col === b.col;
}

export function addressKey(address: CellAddress): string {
  return `${address.row}:${address.col}`;
}

export function cellKey(gridId: string, address: CellAddress): string {
  return `${gridId}:${address.row}:${address.col}`;
}

export function inBounds(address: CellAddress, grid: GridDescriptor): boolean {
  return (
    address.row >= 0 &&
    address.col >= 0 &&
    address.row < grid.rowCount &&
    address.col < grid.colCount
  );
}

export function clampAddress(address: CellAddress, grid: GridDescriptor): CellAddress {
  if (grid.rowCount < 1 || grid.colCount < 1) {
    return { row: 0, col: 0 };
  }
  return {
    row: Math.min(Math.max(0, address.row), grid.rowCount - 1),
    col: Math.min(Math.max(0, address.col), grid.colCount - 1),
  };
}

export function compareRaster(a: CellAddress, b: CellAddress): number {
  if (a.row !== b.row) return a.row - b.row;
  return a.col - b.col;
}
