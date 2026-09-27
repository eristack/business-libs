import { describe, expect, it } from "vitest";

import {
  checksumEquals,
  normalizeChecksumHex,
  sha256Hex,
} from "../src/index.js";

describe("sha256Hex", () => {
  it("hashes utf8 strings", () => {
    expect(sha256Hex("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
});

describe("normalizeChecksumHex", () => {
  it("lowercases hex", () => {
    expect(normalizeChecksumHex(" ABCD ")).toBe("abcd");
  });
});

describe("checksumEquals", () => {
  it("compares timing-safe", () => {
    const h = sha256Hex("x");
    expect(checksumEquals(h, h)).toBe(true);
    expect(checksumEquals(h, sha256Hex("y"))).toBe(false);
  });
});
