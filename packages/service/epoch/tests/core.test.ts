import { describe, expect, it } from "vitest";
import { compareEpochs, createEpoch, createMemoryEpochStore } from "../src/index.js";
import { StaleEpochError } from "../src/core/errors.js";

describe("compareEpochs", () => {
  it("returns use-cache when equal", () => {
    expect(compareEpochs(3, 3)).toBe("use-cache");
  });

  it("returns refetch when different", () => {
    expect(compareEpochs(2, 5)).toBe("refetch");
  });
});

describe("createEpoch", () => {
  it("bumps and resolves cache policy", async () => {
    const epoch = createEpoch({ store: createMemoryEpochStore() });
    expect(await epoch.current("orders")).toBe(0);

    const next = await epoch.bump("orders");
    expect(next).toBe(1);

    const stale = await epoch.resolveCachePolicy("orders", 0);
    expect(stale.policy).toBe("refetch");
    expect(stale.current).toBe(1);

    const fresh = await epoch.resolveCachePolicy("orders", 1);
    expect(fresh.policy).toBe("use-cache");
  });

  it("throws StaleEpochError on optimistic bump mismatch", async () => {
    const epoch = createEpoch({ store: createMemoryEpochStore() });
    await epoch.bump("products");
    await expect(epoch.bump("products", { expected: 0 })).rejects.toBeInstanceOf(
      StaleEpochError,
    );
  });

  it("assertFresh throws when client epoch is stale", async () => {
    const epoch = createEpoch({ store: createMemoryEpochStore() });
    await epoch.bump("inventory");
    await expect(epoch.assertFresh("inventory", 0)).rejects.toBeInstanceOf(
      StaleEpochError,
    );
  });
});

describe("package exports", () => {
  it("resolves @eristack/epoch/backseat through package exports", async () => {
    const mod = await import("@eristack/epoch/backseat");
    expect(mod.registerEpochBackseat).toBeTypeOf("function");
    expect(mod.createBackseatEpochStores).toBeTypeOf("function");
  });
});
