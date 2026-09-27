import type { ReactNode } from "react";
import type { CalculatedLine } from "@eristack/qups";

export type LineGridColumn = {
  id: string;
  header: string;
};

export type LineGridProps = {
  line: CalculatedLine;
  columns: LineGridColumn[];
  renderCell: (columnId: string, line: CalculatedLine) => ReactNode;
};

export function LineGrid({ line, columns, renderCell }: LineGridProps) {
  return (
    <table className="erista-line-grid" data-component="line-grid">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {columns.map((column) => (
            <td key={column.id}>{renderCell(column.id, line)}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
