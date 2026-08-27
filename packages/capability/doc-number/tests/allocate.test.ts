import { describe, expect, it } from "vitest";
import {
  createDocNumber,
  createMemoryFormatStore,
  createMemorySequenceStore,
  FormatNotFoundError,
  MissingDependencyError,
} from "../src/index.js";

describe("createDocNumber allocate", () => {
  it("registers format and allocates next numbers", async () => {
    const clock = () => new Date("2026-08-11T00:00:00.000Z");
    const doc = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
      clock,
      idFactory: () => "fmt_1",
    });

    await doc.registerFormat({
      entityKey: "invoice",
      pattern: "INV-{YYYY}{MM}-{SEQ:5}",
      reset: "monthly",
    });

    const first = await doc.next({ entityKey: "invoice" });
    expect(first).toMatchObject({
      value: "INV-202608-00001",
      sequence: 1,
      periodKey: "2026-08",
      formatId: "fmt_1",
    });

    const second = await doc.next({ entityKey: "invoice" });
    expect(second.value).toBe("INV-202608-00002");
    expect(second.sequence).toBe(2);

    const peek = await doc.peekNext({ entityKey: "invoice" });
    expect(peek).toEqual({
      sequence: 3,
      periodKey: "2026-08",
      value: "INV-202608-00003",
    });
  });

  it("uses format timezone for tokens and period keys", async () => {
    const doc = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
      clock: () => new Date("2026-12-31T17:00:00.000Z"),
      idFactory: () => "fmt_jo",
    });

    await doc.registerFormat({
      entityKey: "job",
      pattern: "JO/{YYYY}/{SEQ:5}",
      reset: "yearly",
      timezone: "Asia/Jakarta",
    });

    const first = await doc.next({ entityKey: "job" });
    expect(first).toMatchObject({
      value: "JO/2027/00001",
      periodKey: "2027",
      sequence: 1,
    });
  });

  it("rolls sequence when period changes", async () => {
    let now = new Date("2026-08-31T00:00:00.000Z");
    const doc = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
      clock: () => now,
    });

    await doc.registerFormat({
      entityKey: "invoice",
      pattern: "INV-{YYYY}{MM}-{SEQ:3}",
      reset: "monthly",
    });

    expect((await doc.next({ entityKey: "invoice" })).value).toBe("INV-202608-001");
    now = new Date("2026-09-01T00:00:00.000Z");
    expect((await doc.next({ entityKey: "invoice" })).value).toBe("INV-202609-001");
  });

  it("uses custom incrementer instead of store allocate", async () => {
    let n = 100;
    const sequences = createMemorySequenceStore();
    const doc = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences,
      incrementer: async () => {
        n += 1;
        return n;
      },
      clock: () => new Date("2026-01-01T00:00:00.000Z"),
    });

    await doc.registerFormat({
      entityKey: "po",
      pattern: "PO-{SEQ:4}",
      reset: "never",
    });

    const result = await doc.next({ entityKey: "po" });
    expect(result.sequence).toBe(101);
    expect(result.value).toBe("PO-0101");
    // Store was not used for allocate
    expect(await sequences.getCurrent({ formatId: result.formatId, periodKey: "*" })).toBeNull();
  });

  it("applies optional prefix", async () => {
    const doc = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
      clock: () => new Date("2026-01-02T00:00:00.000Z"),
    });
    await doc.registerFormat({
      entityKey: "receipt",
      pattern: "{YYYY}-{SEQ:2}",
      prefix: "RC-",
      reset: "yearly",
    });
    expect((await doc.next({ entityKey: "receipt" })).value).toBe("RC-2026-01");
  });

  it("allocates independent sequences per scope", async () => {
    const doc = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences: createMemorySequenceStore(),
      clock: () => new Date("2026-01-01T00:00:00.000Z"),
      idFactory: () => "fmt_job",
    });

    await doc.registerFormat({
      entityKey: "job",
      pattern: "JO/{SCOPE}/{YYYY}/{SEQ:5}",
      reset: "yearly",
    });

    const sub = await doc.next({ entityKey: "job", scope: "SUB" });
    const jkt = await doc.next({ entityKey: "job", scope: "JKT" });
    const sub2 = await doc.next({ entityKey: "job", scope: "SUB" });

    expect(sub).toMatchObject({ value: "JO/SUB/2026/00001", scope: "SUB", sequence: 1 });
    expect(jkt).toMatchObject({ value: "JO/JKT/2026/00001", scope: "JKT", sequence: 1 });
    expect(sub2).toMatchObject({ value: "JO/SUB/2026/00002", scope: "SUB", sequence: 2 });

    const company = await doc.next({ entityKey: "job" });
    expect(company.scope).toBe("");
    expect(company.sequence).toBe(1);
  });

  it("errors on missing format or dependencies", async () => {
    const bare = createDocNumber({});
    await expect(bare.next({ entityKey: "x" })).rejects.toBeInstanceOf(MissingDependencyError);

    const withFormats = createDocNumber({ formats: createMemoryFormatStore() });
    await expect(withFormats.next({ entityKey: "missing" })).rejects.toBeInstanceOf(
      FormatNotFoundError,
    );
  });
});
