import { describe, expect, it } from "vitest";
import { createDataGrid, toSearch, fromSearch } from "../src/index.js";

const schema = {
  fields: [
    { name: "name", type: "string" as const, filterable: true, sortable: true, searchable: true },
    { name: "age", type: "number" as const, filterable: true, sortable: true },
    { name: "status", type: "enum" as const, filterable: true, sortable: true, enumValues: ["active", "paused"] },
    { name: "createdAt", type: "date" as const, filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "name", dir: "asc" as const }],
  defaultPageSize: 2,
  maxPageSize: 50,
};

const rows = [
  { name: "Ada", age: 36, status: "active", createdAt: "2024-01-01" },
  { name: "Grace", age: 40, status: "paused", createdAt: "2024-02-01" },
  { name: "Alan", age: 41, status: "active", createdAt: "2023-12-01" },
  { name: "Barbara", age: 30, status: "active", createdAt: "2024-03-01" },
];

const advancedFilters = {
  type: "group" as const,
  logic: "and" as const,
  children: [
    { type: "clause" as const, field: "age", op: "gte" as const, value: 36 },
    {
      type: "clause" as const,
      field: "status",
      op: "in" as const,
      value: ["active", "paused"],
    },
  ],
};

describe("data-grid core", () => {
  const grid = createDataGrid(schema);

  it("parses JSON filters/sorts from URL (TanStack Router wire)", () => {
    const filters = encodeURIComponent(JSON.stringify(advancedFilters));
    const sorts = encodeURIComponent(
      JSON.stringify([{ field: "age", dir: "desc" }]),
    );
    const query = grid.parse(
      `mode=advanced&filters=${filters}&sorts=${sorts}&page=1&pageSize=10`,
    );
    expect(query.mode).toBe("advanced");
    expect(query.sorts[0]).toEqual({ field: "age", dir: "desc" });
    const result = grid.applyInMemory(rows, query);
    expect(result.items.map((r) => r.name)).toEqual(["Alan", "Grace", "Ada"]);
  });

  it("accepts already-parsed Router search objects", () => {
    const query = grid.fromSearch({
      mode: "advanced",
      filters: advancedFilters,
      sorts: [{ field: "age", dir: "desc" }],
      page: 1,
      pageSize: 10,
    });
    expect(query.filters).toEqual(advancedFilters);
    expect(toSearch(query).sorts).toEqual([{ field: "age", dir: "desc" }]);
  });

  it("uses search mode separately from advanced filters", () => {
    const result = grid.applyInMemory(rows, {
      mode: "search",
      search: "ba",
      sorts: [{ field: "name", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
      filters: {
        type: "clause",
        field: "age",
        op: "gte",
        value: 100,
      },
    });
    // search mode ignores filters
    expect(result.items.map((r) => r.name)).toEqual(["Barbara"]);
  });

  it("paginates with offset", () => {
    const sorts = encodeURIComponent(
      JSON.stringify([{ field: "name", dir: "asc" }]),
    );
    const result = grid.applyInMemory(
      rows,
      `page=2&pageSize=2&sorts=${sorts}`,
    );
    expect(result.items.map((r) => r.name)).toEqual(["Barbara", "Grace"]);
    expect(result.pageInfo).toMatchObject({
      mode: "offset",
      page: 2,
      total: 4,
      hasNext: false,
      hasPrev: true,
    });
  });

  it("paginates with cursor", () => {
    const sorts = encodeURIComponent(
      JSON.stringify([{ field: "name", dir: "asc" }]),
    );
    const first = grid.applyInMemory(
      rows,
      `pageMode=cursor&limit=2&sorts=${sorts}`,
    );
    expect(first.items.map((r) => r.name)).toEqual(["Ada", "Alan"]);
    expect(first.pageInfo.mode).toBe("cursor");
    if (first.pageInfo.mode !== "cursor") throw new Error("expected cursor");
    expect(first.pageInfo.nextCursor).toBeTruthy();

    const second = grid.applyInMemory(rows, {
      mode: "advanced",
      sorts: [{ field: "name", dir: "asc" }],
      page: {
        mode: "cursor",
        limit: 2,
        cursor: first.pageInfo.nextCursor,
      },
    });
    expect(second.items.map((r) => r.name)).toEqual(["Barbara", "Grace"]);
  });

  it("round-trips serialize with JSON nested params", () => {
    const query = grid.parse({
      mode: "search",
      q: "ada",
      sorts: [{ field: "name", dir: "asc" }],
      page: 1,
      pageSize: 5,
    });
    const again = grid.parse(grid.serialize(query));
    expect(again.mode).toBe("search");
    expect(again.search).toBe("ada");
    expect(again.sorts[0]).toEqual({ field: "name", dir: "asc" });

    const search = grid.serializeSearch(query);
    expect(search.sorts).toEqual([{ field: "name", dir: "asc" }]);
    expect(typeof search.page).toBe("number");
    expect(fromSearch(search, schema).search).toBe("ada");
  });

  it("supports between / contains / isNull ops in memory", () => {
    const result = grid.applyInMemory(rows, {
      mode: "advanced",
      filters: {
        type: "group",
        logic: "and",
        children: [
          { type: "clause", field: "age", op: "between", value: [35, 41] },
          { type: "clause", field: "name", op: "contains", value: "a" },
        ],
      },
      sorts: [{ field: "age", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    });
    expect(result.items.map((r) => r.name)).toEqual(["Ada", "Grace", "Alan"]);
  });
});

describe("buildDataGridResult", () => {
  it("builds offset pageInfo from total", async () => {
    const { buildDataGridResult } = await import("../src/index.js");
    const result = buildDataGridResult({
      items: [{ id: 1 }, { id: 2 }],
      query: {
        mode: "advanced",
        sorts: [],
        page: { mode: "offset", page: 2, pageSize: 2 },
      },
      total: 5,
    });
    expect(result.pageInfo).toMatchObject({
      mode: "offset",
      page: 2,
      total: 5,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });
});

describe("filter builder", () => {
  it("builds and/or nodes from draft rows and skips incomplete rows", async () => {
    const {
      filterRowsToNode,
      nodeToFilterRows,
      resetPagination,
      suggestedOpsForType,
    } = await import("../src/index.js");

    const node = filterRowsToNode(
      [
        { id: "1", field: "status", op: "eq", value: "open" },
        { id: "2", field: "name", op: "contains", value: "" }, // skip
        { id: "3", field: "age", op: "gte", value: 18 },
      ],
      "and",
    );
    expect(node).toEqual({
      type: "group",
      logic: "and",
      children: [
        { type: "clause", field: "status", op: "eq", value: "open" },
        { type: "clause", field: "age", op: "gte", value: 18 },
      ],
    });

    const roundTrip = nodeToFilterRows(node);
    expect(roundTrip.logic).toBe("and");
    expect(roundTrip.rows).toHaveLength(2);
    expect(roundTrip.rows[0]?.field).toBe("status");

    expect(resetPagination({ mode: "offset", page: 4, pageSize: 10 })).toEqual({
      mode: "offset",
      page: 1,
      pageSize: 10,
    });
    expect(suggestedOpsForType("boolean")).toContain("eq");
    expect(suggestedOpsForType("string")).toContain("contains");
    expect(suggestedOpsForType("decimal")).toContain("gte");
  });
});

describe("decimal field type", () => {
  const decimalSchema = {
    fields: [
      {
        name: "unitPrice",
        type: "decimal" as const,
        filterable: true,
        sortable: true,
      },
    ],
    defaultPageSize: 10,
    maxPageSize: 50,
  };

  const products = [
    { unitPrice: "300.00" },
    { unitPrice: "4990000.00" },
    { unitPrice: "1200.50" },
  ];

  it("sorts decimal strings without Number() corruption", () => {
    const grid = createDataGrid(decimalSchema);
    const result = grid.applyInMemory(products, {
      mode: "advanced",
      sorts: [{ field: "unitPrice", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    });
    expect(result.items.map((row) => row.unitPrice)).toEqual([
      "300.00",
      "1200.50",
      "4990000.00",
    ]);
  });

  it("filters with gte on decimal strings", () => {
    const grid = createDataGrid(decimalSchema);
    const result = grid.applyInMemory(products, {
      mode: "advanced",
      filters: {
        type: "clause",
        field: "unitPrice",
        op: "gte",
        value: "1000.00",
      },
      sorts: [{ field: "unitPrice", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    });
    expect(result.items.map((row) => row.unitPrice)).toEqual([
      "1200.50",
      "4990000.00",
    ]);
  });
});

describe("wall field type", () => {
  const wallSchema = {
    fields: [
      {
        name: "etd",
        type: "wall" as const,
        timezone: "Asia/Jakarta",
        filterable: true,
        sortable: true,
      },
    ],
    defaultPageSize: 10,
    maxPageSize: 50,
  };

  const jobs = [
    {
      etd: {
        kind: "wall" as const,
        local: "2026-09-04",
        timezone: "Asia/Jakarta",
      },
    },
    {
      etd: {
        kind: "wall" as const,
        local: "2026-09-01",
        timezone: "Asia/Jakarta",
      },
    },
    {
      etd: {
        kind: "wall" as const,
        local: "2026-09-10",
        timezone: "Asia/Jakarta",
      },
    },
  ];

  it("sorts wall dates in zone order", () => {
    const grid = createDataGrid(wallSchema);
    const result = grid.applyInMemory(jobs, {
      mode: "advanced",
      sorts: [{ field: "etd", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    });
    expect(result.items.map((row) => row.etd.local)).toEqual([
      "2026-09-01",
      "2026-09-04",
      "2026-09-10",
    ]);
  });

  it("filters inclusive wall range without Date.parse", () => {
    const grid = createDataGrid(wallSchema);
    const result = grid.applyInMemory(jobs, {
      mode: "advanced",
      filters: {
        type: "clause",
        field: "etd",
        op: "between",
        value: ["2026-09-01", "2026-09-07"],
      },
      sorts: [{ field: "etd", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    });
    expect(result.items.map((row) => row.etd.local)).toEqual([
      "2026-09-01",
      "2026-09-04",
    ]);
  });
});
