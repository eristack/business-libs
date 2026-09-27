import { describe, expect, it } from "vitest";

import { generateApiKey, hashApiKey, verifyApiKey } from "../src/index.js";

describe("api-key", () => {
  it("generates prefixed keys", () => {
    const { key, keyId } = generateApiKey("test");
    expect(key.startsWith("test_")).toBe(true);
    expect(keyId.length).toBeGreaterThan(0);
  });

  it("verifies with optional pepper", () => {
    const { key } = generateApiKey();
    const hash = hashApiKey(key, "pep");
    expect(verifyApiKey(key, hash, "pep")).toBe(true);
    expect(verifyApiKey(key + "x", hash, "pep")).toBe(false);
  });
});
