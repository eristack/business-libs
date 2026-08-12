import type { DataGridSchema } from "@eristack/data-grid";

/** Schema for `listSessions` / sessions grid endpoints. */
export const sessionDataGridSchema = {
  fields: [
    {
      name: "id",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    {
      name: "familyId",
      type: "string",
      filterable: true,
      sortable: true,
      searchable: true,
    },
    { name: "createdAt", type: "date", filterable: true, sortable: true },
    { name: "expiresAt", type: "date", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "createdAt", dir: "desc" }],
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultMode: "advanced",
  defaultPageMode: "offset",
} as const satisfies DataGridSchema;
