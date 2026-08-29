import { describe, expect, it } from "vitest";
import { createRestRouter, toOpenApiDocument } from "../src/core/router.js";

describe("createRestRouter", () => {
  it("dispatches by method and path params", async () => {
    const router = createRestRouter([
      {
        method: "GET",
        path: "/orders/:id",
        summary: "Get order",
        handler: (ctx) => ({
          status: 200,
          body: { id: ctx.params.id },
        }),
      },
    ]);

    const hit = await router.dispatch({ method: "GET", path: "/orders/ord_1" });
    expect(hit.matched).toBe(true);
    expect(hit.matched && hit.response.body).toEqual({ id: "ord_1" });

    const miss = await router.dispatch({ method: "POST", path: "/orders/ord_1" });
    expect(miss.matched).toBe(false);
  });
});

describe("toOpenApiDocument", () => {
  it("emits OpenAPI 3.1 paths", () => {
    const router = createRestRouter([
      {
        method: "GET",
        path: "/health",
        summary: "Health check",
        tags: ["meta"],
        handler: () => ({ status: 200, body: { ok: true } }),
      },
    ]);

    const doc = toOpenApiDocument(router.routes, {
      title: "Demo",
      version: "1.0.0",
    });

    expect(doc.openapi).toBe("3.1.0");
    expect(doc.info.title).toBe("Demo");
    expect(doc.paths["/health"]?.get?.summary).toBe("Health check");
  });
});
