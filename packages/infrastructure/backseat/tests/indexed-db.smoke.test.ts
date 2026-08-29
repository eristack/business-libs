import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { createIndexedDbBackseatStore } from "../src/store/indexed-db-store.js";

describe("IndexedDB backseat store smoke", () => {
  it("creates collection and round-trips a document", async () => {
    const store = createIndexedDbBackseatStore({
      dbName: `eristack-test-${Date.now()}`,
    });

    await store.create("orders", {
      id: "ord_1",
      number: "SO-1",
      status: "draft",
    });

    const doc = await store.get("orders", "ord_1");
    expect(doc).toMatchObject({ id: "ord_1", number: "SO-1" });
  });
});
