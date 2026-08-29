import { describe, expect, it } from "vitest";
import {
  createDataGrid,
  executeInMemoryList,
  parseSavedView,
  serializeSavedView,
} from "../src/index.js";

describe("saved views", () => {
  const schema = {
    fields: [
      { name: "status", type: "enum" as const, filterable: true, enumValues: ["open"] },
      { name: "total", type: "decimal" as const, filterable: true, sortable: true },
    ],
    defaultPageSize: 10,
    maxPageSize: 50,
  };

  it("round-trips query JSON", () => {
    const grid = createDataGrid(schema);
    const query = grid.parse({
      mode: "advanced",
      filters: {
        type: "clause",
        field: "status",
        op: "eq",
        value: "open",
      },
    });
    const raw = serializeSavedView({ id: "v1", name: "Open only", query });
    const restored = parseSavedView(raw, schema);
    expect(restored.name).toBe("Open only");
    expect(restored.query.mode).toBe("advanced");
  });
});

describe("executeInMemoryList", () => {
  it("returns drizzle-compatible list envelope", () => {
    const schema = {
      fields: [
        { name: "name", type: "string" as const, filterable: true, searchable: true },
      ],
      defaultPageSize: 10,
      maxPageSize: 50,
      defaultMode: "search" as const,
    };
    const result = executeInMemoryList({
      schema,
      items: [{ name: "Alpha" }, { name: "Beta" }],
      query: {
        mode: "search",
        q: "Alpha",
      },
    });
    expect(result.items).toEqual([{ name: "Alpha" }]);
    expect(result.pageInfo.mode).toBe("offset");
    expect(result.query.mode).toBe("search");
  });
});
