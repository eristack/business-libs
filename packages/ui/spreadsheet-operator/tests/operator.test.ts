import { describe, expect, it } from "vitest";
import {
  createSpreadsheetOperator,
  getNextEditableAddress,
  type CellNavKind,
  type GridDescriptor,
} from "../src/index.js";

function gridFromKinds(id: string, kinds: CellNavKind[][]): GridDescriptor {
  const rowCount = kinds.length;
  const colCount = kinds[0]?.length ?? 0;
  return {
    id,
    rowCount,
    colCount,
    cellAt: ({ row, col }) => ({
      kind: kinds[row]?.[col] ?? "display",
      fieldKey: `r${row}c${col}`,
    }),
  };
}

const MIXED = gridFromKinds("sheet", [
  ["editable", "readonly", "editable"],
  ["display", "editable", "select"],
  ["editable", "editable", "display"],
]);

describe("getNextEditableAddress", () => {
  it("skips readonly and display on arrows", () => {
    expect(getNextEditableAddress(MIXED, { row: 0, col: 0 }, "right")).toEqual({
      row: 0,
      col: 2,
    });
    expect(getNextEditableAddress(MIXED, { row: 0, col: 0 }, "down")).toEqual({
      row: 2,
      col: 0,
    });
  });

  it("tabs across editable and select, wrapping", () => {
    expect(getNextEditableAddress(MIXED, { row: 0, col: 0 }, "next")).toEqual({
      row: 0,
      col: 2,
    });
    expect(getNextEditableAddress(MIXED, { row: 0, col: 2 }, "next")).toEqual({
      row: 1,
      col: 1,
    });
    expect(getNextEditableAddress(MIXED, { row: 2, col: 1 }, "next")).toEqual({
      row: 0,
      col: 0,
    });
    expect(getNextEditableAddress(MIXED, { row: 0, col: 0 }, "prev")).toEqual({
      row: 2,
      col: 1,
    });
  });
});

describe("createSpreadsheetOperator", () => {
  it("isolates activity to one active grid", () => {
    const op = createSpreadsheetOperator();
    const sell = gridFromKinds("sell", [
      ["editable", "editable"],
      ["editable", "editable"],
    ]);
    const buy = gridFromKinds("buy", [
      ["editable", "editable"],
      ["editable", "editable"],
    ]);
    op.registerGrid(sell);
    op.registerGrid(buy);

    op.dispatch({ type: "activate", gridId: "sell", address: { row: 0, col: 0 } });
    op.handleKeyDown({ key: "ArrowRight" });
    expect(op.getState()).toEqual({
      mode: "active",
      gridId: "sell",
      address: { row: 0, col: 1 },
    });

    op.dispatch({ type: "activate", gridId: "buy", address: { row: 1, col: 0 } });
    op.handleKeyDown({ key: "ArrowRight" });
    expect(op.getState()).toEqual({
      mode: "active",
      gridId: "buy",
      address: { row: 1, col: 1 },
    });
  });

  it("Enter starts edit then commit moves down", () => {
    const op = createSpreadsheetOperator();
    op.registerGrid(
      gridFromKinds("g", [
        ["editable", "editable"],
        ["editable", "editable"],
      ]),
    );
    op.dispatch({ type: "activate", gridId: "g", address: { row: 0, col: 0 } });
    const start = op.dispatch({ type: "enter" });
    expect(start.state).toMatchObject({
      mode: "editing",
      gridId: "g",
      address: { row: 0, col: 0 },
    });
    expect(start.effects).toEqual([
      { type: "startEdit", gridId: "g", address: { row: 0, col: 0 } },
    ]);

    const committed = op.dispatch({ type: "enter" });
    expect(committed.state).toEqual({
      mode: "active",
      gridId: "g",
      address: { row: 1, col: 0 },
    });
    expect(committed.effects).toEqual([
      {
        type: "commit",
        gridId: "g",
        address: { row: 0, col: 0 },
        fieldKey: "r0c0",
        phase: "commit",
      },
    ]);
  });

  it("Tab wraps editable cells and commits while editing", () => {
    const op = createSpreadsheetOperator();
    op.registerGrid(
      gridFromKinds("g", [
        ["editable", "readonly"],
        ["display", "editable"],
      ]),
    );
    op.dispatch({ type: "activate", gridId: "g", address: { row: 0, col: 0 } });
    op.handleKeyDown({ key: "Tab" });
    expect(op.getState()).toMatchObject({
      mode: "active",
      address: { row: 1, col: 1 },
    });
    op.handleKeyDown({ key: "Tab" });
    expect(op.getState()).toMatchObject({
      mode: "active",
      address: { row: 0, col: 0 },
    });

    op.dispatch({ type: "enter" });
    const tab = op.dispatch({ type: "tab" });
    expect(tab.effects[0]?.type).toBe("commit");
    expect(tab.state).toMatchObject({
      mode: "active",
      address: { row: 1, col: 1 },
    });
  });

  it("Escape cancels edit then deactivates", () => {
    const op = createSpreadsheetOperator();
    op.registerGrid(gridFromKinds("g", [["editable"]]));
    op.dispatch({ type: "activate", gridId: "g", address: { row: 0, col: 0 } });
    op.dispatch({ type: "enter" });
    const cancel = op.dispatch({ type: "escape" });
    expect(cancel.effects).toEqual([
      { type: "cancel", gridId: "g", address: { row: 0, col: 0 }, phase: "cancel" },
    ]);
    expect(op.getState()).toMatchObject({ mode: "active" });
    op.dispatch({ type: "escape" });
    expect(op.getState()).toEqual({ mode: "inactive" });
  });

  it("type-to-edit seeds the editing state", () => {
    const op = createSpreadsheetOperator();
    op.registerGrid(gridFromKinds("g", [["editable"]]));
    op.dispatch({ type: "activate", gridId: "g", address: { row: 0, col: 0 } });
    expect(op.handleKeyDown({ key: "9" })).toBe(true);
    expect(op.getState()).toMatchObject({
      mode: "editing",
      seed: "9",
    });
  });

  it("ignores keys while inactive", () => {
    const op = createSpreadsheetOperator();
    op.registerGrid(gridFromKinds("g", [["editable"]]));
    expect(op.handleKeyDown({ key: "ArrowDown" })).toBe(false);
    expect(op.getState()).toEqual({ mode: "inactive" });
  });
});
