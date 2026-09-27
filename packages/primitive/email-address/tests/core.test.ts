import { describe, expect, it } from "vitest";
import { emailEquals, normalizeEmail } from "../src/index.js";

describe("normalizeEmail", () => {
  it("lowercases domain", () => {
    expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
  });

  it("emailEquals", () => {
    expect(emailEquals("A@b.com", "a@b.com")).toBe(true);
  });
});
