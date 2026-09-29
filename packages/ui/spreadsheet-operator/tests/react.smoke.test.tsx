import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { GridDescriptor } from "../src/index.js";
import {
  isKeyTargetOutsideActiveGrid,
  isPointerTargetOutsideGrids,
  SpreadsheetGridIdProvider,
  SpreadsheetNavCell,
  SpreadsheetScopeProvider,
  SpreadsheetTable,
  SpreadsheetTextCell,
  useSpreadsheetGrid,
  useSpreadsheetScope,
  type KeyTargetLike,
} from "../src/react/index.js";

function fakeTarget(opts: {
  editable?: boolean;
  gridId?: string | null;
  contentEditable?: boolean;
}): KeyTargetLike {
  return {
    matches: () => opts.editable === true,
    isContentEditable: opts.contentEditable === true,
    closest: () =>
      opts.gridId === undefined || opts.gridId === null
        ? null
        : { getAttribute: () => opts.gridId ?? null },
  };
}

const DESCRIPTOR: GridDescriptor = {
  id: "sell",
  rowCount: 1,
  colCount: 1,
  cellAt: () => ({ kind: "editable", fieldKey: "qty" }),
};

function ModeProbe() {
  const { state } = useSpreadsheetScope();
  return <span data-mode={state.mode}>{state.mode}</span>;
}

describe("spreadsheet-operator/react", () => {
  it("renders two isolated tables in one scope", () => {
    const buy: GridDescriptor = { ...DESCRIPTOR, id: "buy" };
    const html = renderToStaticMarkup(
      <SpreadsheetScopeProvider>
        <SpreadsheetTable descriptor={DESCRIPTOR}>
          <tbody>
            <tr>
              <SpreadsheetNavCell address={{ row: 0, col: 0 }}>
                <SpreadsheetTextCell
                  address={{ row: 0, col: 0 }}
                  value="1"
                  onCommit={() => undefined}
                />
              </SpreadsheetNavCell>
            </tr>
          </tbody>
        </SpreadsheetTable>
        <SpreadsheetTable descriptor={buy}>
          <tbody>
            <tr>
              <SpreadsheetNavCell address={{ row: 0, col: 0 }}>
                <SpreadsheetTextCell
                  address={{ row: 0, col: 0 }}
                  value="2"
                  onCommit={() => undefined}
                />
              </SpreadsheetNavCell>
            </tr>
          </tbody>
        </SpreadsheetTable>
        <ModeProbe />
      </SpreadsheetScopeProvider>,
    );
    expect(html).toContain('data-spreadsheet-grid="sell"');
    expect(html).toContain('data-spreadsheet-grid="buy"');
    expect(html).toContain('data-mode="inactive"');
    expect(html).toContain('role="grid"');
    expect(html).toContain('role="gridcell"');
  });

  it("supports div grids via useSpreadsheetGrid + SpreadsheetGridIdProvider", () => {
    function DivGrid() {
      const { gridProps } = useSpreadsheetGrid(DESCRIPTOR);
      return (
        <SpreadsheetGridIdProvider gridId={DESCRIPTOR.id}>
          <div {...gridProps}>
            <table>
              <tbody>
                <tr>
                  <SpreadsheetNavCell address={{ row: 0, col: 0 }}>1</SpreadsheetNavCell>
                </tr>
              </tbody>
            </table>
          </div>
        </SpreadsheetGridIdProvider>
      );
    }
    const html = renderToStaticMarkup(
      <SpreadsheetScopeProvider>
        <DivGrid />
      </SpreadsheetScopeProvider>,
    );
    expect(html).toContain('<div role="grid" data-spreadsheet-grid="sell"');
    expect(html).toContain('role="gridcell"');
  });

  it("ignores keys typed into editable elements outside the active grid", () => {
    expect(isKeyTargetOutsideActiveGrid(fakeTarget({ editable: true, gridId: null }), "sell")).toBe(
      true,
    );
    expect(
      isKeyTargetOutsideActiveGrid(fakeTarget({ editable: true, gridId: "buy" }), "sell"),
    ).toBe(true);
    expect(
      isKeyTargetOutsideActiveGrid(fakeTarget({ editable: true, gridId: "sell" }), "sell"),
    ).toBe(false);
    expect(
      isKeyTargetOutsideActiveGrid(fakeTarget({ contentEditable: true, gridId: null }), "sell"),
    ).toBe(true);
    // Body / buttons / plain cells never block the operator.
    expect(isKeyTargetOutsideActiveGrid(fakeTarget({ gridId: null }), "sell")).toBe(false);
    expect(isKeyTargetOutsideActiveGrid(null, "sell")).toBe(false);
  });

  it("detects pointer-down outside every grid", () => {
    expect(isPointerTargetOutsideGrids(fakeTarget({ gridId: null }))).toBe(true);
    expect(isPointerTargetOutsideGrids(fakeTarget({ gridId: "sell" }))).toBe(false);
    expect(isPointerTargetOutsideGrids(null)).toBe(false);
  });

  it("throws outside the provider", () => {
    function Orphan() {
      useSpreadsheetScope();
      return null;
    }
    expect(() => renderToStaticMarkup(<Orphan />)).toThrow(
      "useSpreadsheetScope must be used within SpreadsheetScopeProvider",
    );
  });
});
