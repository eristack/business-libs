import { describe, expect, it } from "vitest";

import {
  createIdempotencyGuard,
  createMemoryIdempotencyStore,
  IdempotencyConflictError,
} from "../src/index.js";

describe("createIdempotencyGuard", () => {
  it("replays completed results", async () => {
    const store = createMemoryIdempotencyStore();
    const guard = createIdempotencyGuard(store);
    let calls = 0;
    const fn = async () => {
      calls += 1;
      return { ok: true };
    };
    await guard.run("pay-1", fn);
    const replay = await guard.run("pay-1", fn);
    expect(replay).toEqual({ ok: true });
    expect(calls).toBe(1);
  });

  it("throws when key is pending", async () => {
    const store = createMemoryIdempotencyStore();
    const guard = createIdempotencyGuard({ store, waitOnPending: false });
    await store.claim({ key: "_:default:k", requestHash: "abc" });
    await expect(guard.run("k", async () => 1)).rejects.toBeInstanceOf(
      IdempotencyConflictError,
    );
  });
});
