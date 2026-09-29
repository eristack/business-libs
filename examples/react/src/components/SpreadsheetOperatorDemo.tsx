import { useMemo, useState } from "react";
import type { GridDescriptor } from "@eristack/spreadsheet-operator";
import {
  SpreadsheetNavCell,
  SpreadsheetScopeProvider,
  SpreadsheetTable,
  SpreadsheetTextCell,
} from "@eristack/spreadsheet-operator/react";

function emptySheet(): string[][] {
  return [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
}

function MiniGrid({
  id,
  title,
  initial,
}: {
  id: string;
  title: string;
  initial: string[][];
}) {
  const [cells, setCells] = useState(initial);
  const descriptor = useMemo<GridDescriptor>(
    () => ({
      id,
      rowCount: 3,
      colCount: 3,
      cellAt: () => ({ kind: "editable" }),
    }),
    [id],
  );

  return (
    <section className="spreadsheet-pane">
      <h3>{title}</h3>
      <p className="muted">
        Click a cell, then arrows / Tab / Enter. The other grid does not move until
        you click it.
      </p>
      <SpreadsheetTable descriptor={descriptor} className="spreadsheet-table">
        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((value, colIndex) => {
                const address = { row: rowIndex, col: colIndex };
                return (
                  <SpreadsheetNavCell key={colIndex} address={address}>
                    <SpreadsheetTextCell
                      address={address}
                      value={value}
                      onCommit={(next) => {
                        setCells((current) =>
                          current.map((line, i) =>
                            i === rowIndex
                              ? line.map((cell, j) => (j === colIndex ? next : cell))
                              : line,
                          ),
                        );
                      }}
                    />
                  </SpreadsheetNavCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </SpreadsheetTable>
    </section>
  );
}

export function SpreadsheetOperatorDemo() {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">@eristack/spreadsheet-operator</p>
          <h2>Two grids, one keyboard scope</h2>
        </div>
      </div>
      <p className="lede">
        Headless operator + React adapter. Distinct from spreadsheet-render
        (xlsx download) and data-grid (HTTP lists).
      </p>
      <SpreadsheetScopeProvider>
        <div className="spreadsheet-pair">
          <MiniGrid id="sell" title="Sell" initial={emptySheet()} />
          <MiniGrid id="buy" title="Buy" initial={emptySheet()} />
        </div>
      </SpreadsheetScopeProvider>
    </section>
  );
}
