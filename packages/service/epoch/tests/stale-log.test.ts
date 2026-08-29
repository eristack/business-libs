import { describe, expect, it } from "vitest";
import { createEpoch } from "../src/core/create-epoch.js";
import { createMemoryEpochStore } from "../src/core/memory-store.js";
import {
  logEpochCachePolicy,
  withEpochStaleLogging,
} from "../src/core/stale-log.js";

describe("epoch stale logging", () => {
  it("logs only when policy is refetch", () => {
    const logs: unknown[] = [];
    const sink = {
      info: (_msg: string, ctx?: Record<string, unknown>) => logs.push(ctx),
    };

    logEpochCachePolicy({ sink }, {
      scope: "orders",
      clientEpoch: 0,
      current: 1,
      policy: "refetch",
    });
    logEpochCachePolicy({ sink }, {
      scope: "orders",
      clientEpoch: 1,
      current: 1,
      policy: "use-cache",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ scope: "orders", clientEpoch: 0, current: 1 });
  });

  it("wraps resolveCachePolicy", async () => {
    const logs: string[] = [];
    const epoch = withEpochStaleLogging(
      createEpoch({ store: createMemoryEpochStore() }),
      { sink: { info: (msg) => logs.push(msg) } },
    );

    await epoch.bump("orders");
    await epoch.resolveCachePolicy("orders", 0);
    await epoch.resolveCachePolicy("orders", 1);

    expect(logs).toEqual(["epoch stale — refetch"]);
  });
});
