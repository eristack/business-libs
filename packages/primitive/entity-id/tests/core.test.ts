import { describe, expect, it } from "vitest";

import {
  compareEntityIds,
  entityIdEquals,
  entityIdToUnixMs,
  generateEntityId,
  generateEntityIdAt,
  parseEntityId,
  EntityIdParseError,
} from "../src/index.js";

const FIXED_RANDOM = new Uint8Array([
  0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89, 0x01, 0x23,
]);

describe("generateEntityIdAt", () => {
  it("embeds unix ms and version 7", () => {
    const id = generateEntityIdAt(1_700_000_000_123, FIXED_RANDOM);
    expect(id).toBe("018bcfe5-687b-7bcd-af01-234567890123");
    expect(id[14]).toBe("7");
    expect(entityIdToUnixMs(id)).toBe(1_700_000_000_123);
  });

  it("sorts lexicographically by time for fixed random", () => {
    const a = generateEntityIdAt(100, FIXED_RANDOM);
    const b = generateEntityIdAt(200, FIXED_RANDOM);
    expect(compareEntityIds(a, b)).toBeLessThan(0);
  });
});

describe("parseEntityId", () => {
  it("accepts hyphenless input", () => {
    const id = generateEntityIdAt(100, FIXED_RANDOM);
    const compact = id.replace(/-/g, "");
    expect(parseEntityId(compact)).toBe(id);
  });

  it("rejects uuid v4", () => {
    expect(() =>
      parseEntityId("550e8400-e29b-41d4-a716-446655440000"),
    ).toThrow(EntityIdParseError);
  });
});

describe("generateEntityId", () => {
  it("returns parseable v7 ids", () => {
    const id = generateEntityId();
    expect(parseEntityId(id)).toBe(id);
  });
});

describe("entityIdEquals", () => {
  it("compares normalized forms", () => {
    const id = generateEntityIdAt(50, FIXED_RANDOM);
    expect(entityIdEquals(id, id.replace(/-/g, ""))).toBe(true);
  });
});
