import type { DataGridSchema } from "@eristack/data-grid";

export type OrderListRow = {
  id: string;
  number: string;
  status: string;
  orderedAt: string;
  total: string;
};

/** Flat list row — matches `orders` SQLite table in schema.ts. */
export const orderGridSchema = {
  fields: [
    { name: "number", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "status", type: "string", filterable: true, sortable: true },
    { name: "orderedAt", type: "date", filterable: true, sortable: true },
    { name: "total", type: "decimal", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "orderedAt", dir: "desc" }],
  defaultPageSize: 10,
  maxPageSize: 50,
} satisfies DataGridSchema;
