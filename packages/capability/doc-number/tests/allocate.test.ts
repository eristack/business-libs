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

  it("errors on missing format or dependencies", async () => {
    const bare = createDocNumber({});
    await expect(bare.next({ entityKey: "x" })).rejects.toBeInstanceOf(MissingDependencyError);

    const withFormats = createDocNumber({ formats: createMemoryFormatStore() });
    await expect(withFormats.next({ entityKey: "missing" })).rejects.toBeInstanceOf(
      FormatNotFoundError,
    );
  });
});
