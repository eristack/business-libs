import { describe, expect, it } from "vitest";
import { createBackseat } from "../src/core/create-backseat.js";
import { createMemoryBackseatStore } from "../src/core/memory-store.js";
import { applyCollectionFilter, parseListFilter } from "../src/core/filter.js";
import { createErpDemoSnapshot } from "../src/seeds/erp-demo.js";

describe("createMemoryBackseatStore", () => {
  it("creates, reads, updates, and deletes documents", async () => {
    const store = createMemoryBackseatStore();

    await store.create("products", { id: "p1", name: "Desk" });
    expect(await store.get("products", "p1")).toEqual({ id: "p1", name: "Desk" });

    await store.update("products", "p1", { name: "Standing desk" });
    expect(await store.get("products", "p1")).toMatchObject({
      name: "Standing desk",
    });

    await store.delete("products", "p1");
    expect(await store.get("products", "p1")).toBeNull();
  });

  it("exports and imports snapshots", async () => {
    const store = createMemoryBackseatStore();
    await store.create("partners", { id: "a", name: "Acme" });

    const snapshot = await store.exportSnapshot();
    expect(snapshot.partners).toHaveLength(1);

    await store.clear();
    expect(await store.list("partners")).toEqual([]);

    await store.importSnapshot(snapshot);
    expect(await store.list("partners")).toHaveLength(1);
  });
});

describe("createBackseat", () => {
  function setup() {
    const store = createMemoryBackseatStore();
    const api = createBackseat({
      store,
      baseUrl: "/api",
      collections: {
        products: {},
        partners: {},
        purchaseOrders: {},
      },
    });
    return { store, api };
  }

  it("registers CRUD handlers for collections", async () => {
    const { api } = setup();

    const created = await api.handlers.products.create({
      id: "p1",
      sku: "DESK",
      name: "Desk",
    });
    expect(created.id).toBe("p1");

    const listed = await api.handlers.products.list();
    expect(listed).toHaveLength(1);
  });

  it("handles REST list/get/create/patch/delete", async () => {
    const { api } = setup();

    const createRes = await api.handle({
      method: "POST",
      path: "/api/products",
      body: { id: "p1", name: "Desk", status: "draft" },
    });
    expect(createRes.status).toBe(201);

    const listRes = await api.handle({
      method: "GET",
      path: "/api/products",
      query: { status: "draft" },
    });
    expect(listRes.status).toBe(200);
    expect(listRes.body).toEqual([{ id: "p1", name: "Desk", status: "draft" }]);

    const patchRes = await api.handle({
      method: "PATCH",
      path: "/api/products/p1",
      body: { status: "active" },
    });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body).toMatchObject({ status: "active" });

    const deleteRes = await api.handle({
      method: "DELETE",
      path: "/api/products/p1",
    });
    expect(deleteRes.status).toBe(204);
  });

  it("seeds demo ERP snapshot", async () => {
    const { api } = setup();
    await api.seed(createErpDemoSnapshot());

    const partners = await api.handlers.partners.list();
    const products = await api.handlers.products.list();
    const orders = await api.handlers.purchaseOrders.list();

    expect(partners.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
  });

  it("fetch shim returns Response objects", async () => {
    const { api } = setup();
    await api.handlers.products.create({ id: "p1", name: "Desk" });

    const response = await api.fetch("/api/products");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(1);
  });

  it("supports named actions for complex processing", async () => {
    const { api } = setup();
    await api.handlers.products.create({ id: "p1", name: "Desk", status: "active" });
    await api.handlers.products.create({ id: "p2", name: "Chair", status: "draft" });

    api.registerAction("products.activeCount", async ({ store }) => {
      const all = await store.list("products");
      return all.filter((doc) => doc.status === "active").length;
    });

    await expect(api.invoke("products.activeCount", null)).resolves.toBe(1);
  });

  it("supports custom HTTP controllers and splat paths", async () => {
    const { api } = setup();
    await api.handlers.products.create({ id: "p1", name: "Desk", qty: "3" });

    api.registerRoute({
      method: "POST",
      path: "/reports/inventory/*",
      name: "inventory-report",
      handler: async (ctx) => {
        const scope = ctx.params._splat;
        const minQty = Number(ctx.query("minQty") ?? "0");
        const products = await ctx.store.list("products");
        const filtered = products.filter(
          (doc) => Number(doc.qty ?? 0) >= minQty,
        );
        return {
          status: 200,
          body: { scope, count: filtered.length, items: filtered },
        };
      },
    });

    const res = await api.handle({
      method: "POST",
      path: "/api/reports/inventory/warehouse-a/summary",
      query: { minQty: "2" },
      body: {},
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      scope: "warehouse-a/summary",
      count: 1,
    });
  });

  it("reseed uses createBackseat seed option", async () => {
    const seed = createErpDemoSnapshot();
    const api = createBackseat({
      store: createMemoryBackseatStore(),
      seed,
      collections: { partners: {}, products: {}, purchaseOrders: {} },
    });

    await api.reseed();
    expect((await api.handlers.partners.list()).length).toBeGreaterThan(0);
  });
});

describe("filters", () => {
  it("parses json-server-style query params", () => {
    expect(
      parseListFilter({
        status: "approved",
        _sort: "name",
        _order: "desc",
        _page: "2",
        _limit: "5",
      }),
    ).toEqual({
      where: { status: "approved" },
      sort: "name",
      order: "desc",
      offset: 5,
      limit: 5,
    });
  });

  it("applies where/sort/limit filters", () => {
    const docs = [
      { id: "1", name: "B", status: "open" },
      { id: "2", name: "A", status: "open" },
      { id: "3", name: "C", status: "closed" },
    ];

    expect(
      applyCollectionFilter(docs, {
        where: { status: "open" },
        sort: "name",
        order: "asc",
        limit: 1,
      }),
    ).toEqual([{ id: "2", name: "A", status: "open" }]);
  });
});
