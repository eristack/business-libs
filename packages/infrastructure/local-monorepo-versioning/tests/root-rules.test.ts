import { describe, expect, it } from "vitest";
import { planRelease, type VersionLock } from "../src/core/index.js";

const workspace = [
  { key: "web", path: "apps/web" },
  { key: "api", path: "apps/api" },
] as const;

function baseLock(): VersionLock {
  return {
    schema: 1,
    root: "0.1.0",
    packages: {
      "@scope/web": { version: "0.1.0", path: "apps/web", key: "web" },
      "@scope/api": { version: "0.1.0", path: "apps/api", key: "api" },
    },
    releases: [],
  };
}

describe("root bump rules (Tiga normative)", () => {
  it("all at 0.1.0 — web patch advances root one patch step", () => {
    const { nextLock, batchLevel } = planRelease(baseLock(), [
      { key: "web", level: "patch" },
    ]);
    expect(batchLevel).toBe("patch");
    expect(nextLock.root).toBe("0.1.1");
    expect(nextLock.packages["@scope/web"].version).toBe("0.1.1");
    expect(nextLock.packages["@scope/api"].version).toBe("0.1.0");
  });

  it("root 0.1.1 — api patch advances root one more patch step", () => {
    const lock: VersionLock = {
      ...baseLock(),
      root: "0.1.1",
      packages: {
        "@scope/web": { version: "0.1.1", path: "apps/web", key: "web" },
        "@scope/api": { version: "0.1.0", path: "apps/api", key: "api" },
      },
    };
    const { nextLock } = planRelease(lock, [{ key: "api", level: "patch" }]);
    expect(nextLock.root).toBe("0.1.2");
    expect(nextLock.packages["@scope/api"].version).toBe("0.1.1");
  });

  it("api minor + web patch — root takes one minor step", () => {
    const lock: VersionLock = {
      ...baseLock(),
      root: "0.1.1",
      packages: {
        "@scope/web": { version: "0.1.1", path: "apps/web", key: "web" },
        "@scope/api": { version: "0.1.0", path: "apps/api", key: "api" },
      },
    };
    const { nextLock, batchLevel } = planRelease(lock, [
      { key: "api", level: "minor" },
      { key: "web", level: "patch" },
    ]);
    expect(batchLevel).toBe("minor");
    expect(nextLock.root).toBe("0.2.0");
    expect(nextLock.packages["@scope/api"].version).toBe("0.2.0");
    expect(nextLock.packages["@scope/web"].version).toBe("0.1.2");
  });
});
