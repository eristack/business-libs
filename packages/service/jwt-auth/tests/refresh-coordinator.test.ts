import { describe, expect, it, vi } from "vitest";
import { JwtAuthHttpError } from "../src/client/http-error.js";
import { createRefreshCoordinator } from "../src/client/refresh-coordinator.js";

describe("createRefreshCoordinator", () => {
  it("retries network errors then succeeds", async () => {
    let calls = 0;
    const refresh = createRefreshCoordinator(async () => {
      calls += 1;
      if (calls < 3) throw new TypeError("Failed to fetch");
      return "ok";
    }, { crossTabLock: false, maxNetworkRetries: 3 });

    await expect(refresh()).resolves.toBe("ok");
    expect(calls).toBe(3);
  });

  it("does not retry auth failures", async () => {
    const refresh = createRefreshCoordinator(async () => {
      throw new JwtAuthHttpError(401, "denied", null);
    }, { crossTabLock: false });

    await expect(refresh()).rejects.toMatchObject({ status: 401 });
  });
});
