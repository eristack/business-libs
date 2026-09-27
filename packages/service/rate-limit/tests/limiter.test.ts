import { describe, expect, it } from "vitest";

import { createRateLimiter } from "../src/index.js";

describe("createRateLimiter", () => {
  it("allows up to max within window", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
    expect(limiter.check("ip", 0).allowed).toBe(true);
    expect(limiter.check("ip", 0).allowed).toBe(true);
    expect(limiter.check("ip", 0).allowed).toBe(false);
  });

  it("resets after window", () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limiter.check("k", 0).allowed).toBe(true);
    expect(limiter.check("k", 0).allowed).toBe(false);
    expect(limiter.check("k", 1000).allowed).toBe(true);
  });
});
