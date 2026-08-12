import type { DataGridSchema } from "@eristack/data-grid";

export const ORDER_STATUSES = [
  "draft",
  "open",
  "fulfilled",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CUSTOMER_REGIONS = [
  "na",
  "eu",
  "apac",
  "latam",
] as const;

export type CustomerRegion = (typeof CUSTOMER_REGIONS)[number];

/**
 * Flattened list row: order + customer relation fields + line aggregates.
 * This is what data-grid filters/sorts against (not the raw tables).
 */
export type OrderListRow = {
  id: string;
  number: string;
  status: OrderStatus;
  orderedAt: string;
  notes: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerRegion: CustomerRegion;
  customerActive: boolean;
  assigneeUserId: string | null;
  assigneeName: string | null;
  lineCount: number;
  /** Sum of qty × unitPriceMinor across lines. */
  totalMinor: number;
  /** Decimal string via @eristack/money for display. */
  total: string;
  currency: "USD";
};

export type OrderLineDetail = {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  qty: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  lineTotal: string;
};

export type OrderDetail = OrderListRow & {
  lines: OrderLineDetail[];
};

/**
 * Schema mirrors the SQL projection in `list-orders.ts`.
 * Relation fields (`customerName`, …) and aggregates (`lineCount`, `totalMinor`)
 * are first-class filter/sort columns.
 */
export const orderGridSchema = {
  fields: [
    { name: "number", type: "string", filterable: true, sortable: true, searchable: true },
    {
      name: "status",
      type: "enum",
      filterable: true,
      sortable: true,
      enumValues: ORDER_STATUSES,
    },
    { name: "orderedAt", type: "date", filterable: true, sortable: true },
    { name: "notes", type: "string", filterable: true, searchable: true },
    { name: "customerName", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "customerEmail", type: "string", filterable: true, searchable: true },
    {
      name: "customerRegion",
      type: "enum",
      filterable: true,
      sortable: true,
      enumValues: CUSTOMER_REGIONS,
    },
    { name: "customerActive", type: "boolean", filterable: true, sortable: true },
    { name: "assigneeName", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "lineCount", type: "number", filterable: true, sortable: true },
    { name: "totalMinor", type: "number", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "orderedAt", dir: "desc" }],
  defaultPageSize: 10,
  maxPageSize: 50,
  defaultMode: "advanced",
} satisfies DataGridSchema;
