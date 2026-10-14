import { describe, expect, it } from "vitest";
import {
  backseatCollectionsFromManifests,
  defineErpCollection,
  erpCollectionManifests,
} from "../src/schema/collection.js";

describe("defineErpCollection", () => {
  it("returns a trimmed manifest", () => {
    const m = defineErpCollection<{ id: string; number: string }>({
      collection: "invoices",
      row: {
        toRow: (doc) => ({ id: doc.id, number: doc.number }),
        fromRow: (row) => ({ id: String(row.id), number: String(row.number) }),
      },
    });
    expect(m.collection).toBe("invoices");
    expect(m.row?.fromRow({ id: "1", number: "INV-1" }).number).toBe("INV-1");
  });

  it("bundles manifests", () => {
    const list = erpCollectionManifests([
      defineErpCollection({ collection: "jobs", idField: "id" }),
      defineErpCollection({ collection: "invoices", idField: "id" }),
    ] as const);
    expect(list).toHaveLength(2);
  });

  it("maps to Backseat collection options", () => {
    const opts = backseatCollectionsFromManifests([
      defineErpCollection({ collection: "orders", path: "sales/orders" }),
    ]);
    expect(opts.orders).toEqual({ path: "sales/orders" });
  });
});
