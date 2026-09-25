import { describe, expect, it } from "vitest";
import { createWorkshopClient } from "../src/client/index.js";

describe("createWorkshopClient", () => {
  it("requires baseUrl for express mode", () => {
    expect(() =>
      createWorkshopClient({ mode: "express" }).fetch("/api/jobs"),
    ).toThrow(/baseUrl/);
  });

  it("joins express baseUrl and path", async () => {
    const client = createWorkshopClient({
      mode: "express",
      baseUrl: "http://localhost:3001/",
    });
    const originalFetch = globalThis.fetch;
    let captured = "";
    globalThis.fetch = ((input: RequestInfo) => {
      captured = String(input);
      return Promise.resolve(new Response("{}"));
    }) as typeof fetch;
    try {
      await client.fetch("/api/jobs");
      expect(captured).toBe("http://localhost:3001/api/jobs");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
