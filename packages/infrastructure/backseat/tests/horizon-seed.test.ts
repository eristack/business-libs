import { describe, expect, it } from "vitest";
import { loadHorizonASeedV1 } from "../src/seeds/horizon-a-seed.js";

describe("loadHorizonASeedV1", () => {
  it("loads checked-in horizon demo orders", () => {
    const snapshot = loadHorizonASeedV1();
    expect(snapshot.orders?.length).toBeGreaterThan(0);
    expect(snapshot.orders?.[0]?.id).toBe("ord_demo");
    expect(snapshot.partners?.length).toBeGreaterThan(0);
  });
});
