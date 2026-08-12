import type { DataGridSchema } from "@eristack/data-grid";

/** Schema for `listFormats` / formats grid endpoints. */
export const formatDataGridSchema = {
  fields: [
    {
      name: "id",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    {
      name: "entityKey",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    {
      name: "pattern",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    {
      name: "reset",
      type: "enum",
      filterable: true,
      sortable: true,
      enumValues: ["never", "yearly", "monthly", "daily"],
    },
    {
      name: "prefix",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    { name: "active", type: "boolean", filterable: true, sortable: true },
    { name: "createdAt", type: "date", filterable: true, sortable: true },
    { name: "updatedAt", type: "date", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "createdAt", dir: "desc" }],
  defaultPageSize: 50,
  maxPageSize: 100,
  defaultMode: "advanced",
  defaultPageMode: "offset",
} as const satisfies DataGridSchema;
