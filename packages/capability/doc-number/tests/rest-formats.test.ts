import { describe, expect, it } from "vitest";
import {
  createDocNumber,
  createMemoryFormatStore,
  createMemorySequenceStore,
} from "../src/index.js";
import { createRestActions } from "../src/rest/index.js";

function req(partial: {
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
}) {
  return {
    headers: { get: () => null },
    body: partial.body,
    params: partial.params,
    query: partial.query,
  };
}

describe("REST format configuration", () => {
  it("creates, lists, updates, and previews formats", async () => {
    const docNumber = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
      idFactory: () => "fmt_a",
    });
    const actions = createRestActions({ docNumber });

    const created = await actions.createFormat(
      req({
        body: {
          entityKey: "invoice",
          pattern: "INV-{YYYY}-{SEQ:3}",
          reset: "yearly",
        },
      }),
    );
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      format: { id: "fmt_a", entityKey: "invoice", active: true },
    });

    const listed = await actions.listFormats(
      req({ query: { entityKey: "invoice" } }),
    );
    expect(listed.status).toBe(200);
    expect((listed.body as { items: unknown[] }).items).toHaveLength(1);

    const preview = await actions.preview(
      req({
        body: {
          pattern: "INV-{YYYY}-{SEQ:3}",
          sequence: 7,
          at: "2026-08-11T00:00:00.000Z",
        },
      }),
    );
    expect(preview).toEqual({ status: 200, body: { value: "INV-2026-007" } });

    const updated = await actions.updateFormat(
      req({
        params: { id: "fmt_a" },
        body: { pattern: "INV-{YYYY}{MM}-{SEQ:4}", reset: "monthly" },
      }),
    );
    expect(updated.status).toBe(200);
    expect((updated.body as { format: { pattern: string } }).format.pattern).toBe(
      "INV-{YYYY}{MM}-{SEQ:4}",
    );
  });

  it("keeps a single active format per entityKey", async () => {
    let n = 0;
    const docNumber = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
      idFactory: () => `fmt_${++n}`,
    });
    const actions = createRestActions({ docNumber });

    await actions.createFormat(
      req({
        body: { entityKey: "po", pattern: "PO-{SEQ:2}", active: true },
      }),
    );
    await actions.createFormat(
      req({
        body: { entityKey: "po", pattern: "P-{SEQ:3}", active: true },
      }),
    );

    const active = await actions.getActiveFormat(
      req({ query: { entityKey: "po" } }),
    );
    expect(active.status).toBe(200);
    expect((active.body as { format: { id: string; pattern: string } }).format).toMatchObject({
      id: "fmt_2",
      pattern: "P-{SEQ:3}",
    });

    const listed = await actions.listFormats(req({ query: { entityKey: "po" } }));
    const formats = (listed.body as { items: Array<{ id: string; active: boolean }> })
      .items;
    expect(formats.find((f) => f.id === "fmt_1")?.active).toBe(false);
    expect(formats.find((f) => f.id === "fmt_2")?.active).toBe(true);
  });

  it("returns 400 for invalid pattern", async () => {
    const docNumber = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
    });
    const actions = createRestActions({ docNumber });
    const res = await actions.createFormat(
      req({ body: { entityKey: "x", pattern: "NO-SEQ" } }),
    );
    expect(res.status).toBe(400);
  });
});
