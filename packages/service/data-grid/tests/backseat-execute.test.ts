import { describe, expect, it } from "vitest";
import { createMemoryBackseatStore } from "@eristack/backseat";
import { createDataGrid } from "../src/core/create-data-grid.js";
import { executeBackseatList } from "../src/backseat/execute.js";

describe("executeBackseatList", () => {
  it("returns the same envelope as applyInMemory over mapped rows", async () => {
    const store = createMemoryBackseatStore();
    await store.create("jobs", {
      id: "job_1",
      customerId: "c1",
      etd: "2026-09-04",
      gpIdr: "1500000",
    });
    await store.create("jobs", {
      id: "job_2",
      customerId: "c2",
      etd: "2026-09-10",
      gpIdr: "900000",
    });
    await store.create("partners", { id: "c1", name: "Acme" });
    await store.create("partners", { id: "c2", name: "Beta" });

    const schema = {
      fields: [
        { name: "customerName", type: "string" as const, filterable: true },
        {
          name: "gpIdr",
          type: "decimal" as const,
          filterable: true,
          sortable: true,
        },
      ],
      defaultPageSize: 10,
      maxPageSize: 50,
    };

    const grid = createDataGrid(schema);
    const result = await executeBackseatList({
      store,
      collection: "jobs",
      schema,
      grid,
      query: {
        mode: "advanced",
        filters: {
          type: "clause",
          field: "gpIdr",
          op: "gte",
          value: "1000000",
        },
        sorts: [{ field: "gpIdr", dir: "desc" }],
        page: { mode: "offset", page: 1, pageSize: 10 },
      },
      prefilter: (doc) => doc.customerId === "c1" || doc.customerId === "c2",
      toRow: async (doc) => {
        const partner = await store.get(
          "partners",
          String(doc.customerId),
        );
        return {
          customerName: String(partner?.name ?? ""),
          gpIdr: String(doc.gpIdr ?? ""),
        };
      },
    });

    expect(result.items).toEqual([{ customerName: "Acme", gpIdr: "1500000" }]);
    expect(result.pageInfo).toMatchObject({
      mode: "offset",
      total: 1,
    });
  });
});
