import { describe, expect, it } from "vitest";
import {
  DOCUMENT_ROUTE_SPECS,
  createDocumentRoutes,
  createOpinionRouter,
} from "../src/index.js";

describe("createDocumentRoutes", () => {
  it("emits all seven roles when every handler supplied", () => {
    const noop = async () => ({ status: 204 });
    const routes = createDocumentRoutes({
      basePath: "/products/",
      handlers: {
        options: noop,
        list: noop,
        read: noop,
        create: noop,
        replace: noop,
        transition: noop,
        delete: noop,
      },
    });
    expect(routes).toHaveLength(7);
    expect(routes.find((r) => r.path === "/products/options")).toBeTruthy();
    expect(routes.find((r) => r.path === "/products/data-grid")).toBeTruthy();
  });

  it("normalizes trailing slash on basePath", () => {
    const routes = createDocumentRoutes({
      basePath: "/warehouses/",
      handlers: { read: async () => ({ status: 200, body: {} }) },
    });
    expect(routes[0]?.path).toBe("/warehouses/:id");
  });

  it("emits canonical paths for supplied handlers", async () => {
    const routes = createDocumentRoutes({
      basePath: "/invoices",
      handlers: {
        list: async () => ({ status: 200, body: { items: [] } }),
        transition: async () => ({ status: 204 }),
      },
    });

    expect(routes.map((r) => `${r.method} ${r.path}`)).toEqual([
      "GET /invoices/data-grid",
      "PATCH /invoices/:id/:action",
    ]);
  });

  it("dispatches transition PATCH", async () => {
    const router = createOpinionRouter({
      routes: createDocumentRoutes({
        basePath: "/orders",
        handlers: {
          transition: async (ctx) => ({
            status: 200,
            body: { id: ctx.params.id, action: ctx.params.action },
          }),
        },
      }),
    });

    const result = await router.dispatch({
      method: "PATCH",
      path: "/orders/abc/post",
    });

    expect(result.matched).toBe(true);
    if (result.matched) {
      expect(result.response.body).toEqual({ id: "abc", action: "post" });
    }
  });

  it("returns 404 for unmatched paths", async () => {
    const router = createOpinionRouter({
      routes: createDocumentRoutes({
        basePath: "/items",
        handlers: { read: async () => ({ status: 200, body: {} }) },
      }),
    });
    const result = await router.dispatch({ method: "GET", path: "/items" });
    expect(result.matched).toBe(false);
  });

  it("documents seven canonical roles", () => {
    expect(DOCUMENT_ROUTE_SPECS).toHaveLength(7);
  });
});
