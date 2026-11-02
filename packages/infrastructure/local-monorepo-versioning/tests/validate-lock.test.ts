import { describe, expect, it } from "vitest";
import {
  validateLock,
  validateLockIssues,
  VersionLockValidationError,
  type VersionLock,
} from "../src/core/index.js";

const workspace = [
  { key: "web", path: "apps/web" },
  { key: "api", path: "apps/api" },
];

describe("validateLock", () => {
  it("flags missing workspace members and downgrades", () => {
    const lock = {
      schema: 1,
      root: "0.1.0",
      packages: {
        "@scope/web": { version: "0.1.0", path: "apps/web", key: "web" },
      },
      releases: [],
    } as unknown as VersionLock;

    expect(validateLockIssues(lock, workspace)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('key "api" is missing'),
      ]),
    );
  });

  it("throws VersionLockValidationError when invalid", () => {
    const lock: VersionLock = {
      schema: 1,
      root: "0.1.0",
      packages: {
        "@scope/web": { version: "0.0.9", path: "apps/web", key: "web" },
        "@scope/api": { version: "0.1.0", path: "apps/api", key: "api" },
      },
      releases: [
        {
          id: "r1",
          createdAt: "2026-01-01T00:00:00.000Z",
          root: { from: "0.1.0", to: "0.1.1", level: "patch" },
          packages: [
            {
              name: "@scope/web",
              key: "web",
              from: "0.1.0",
              to: "0.1.1",
              level: "patch",
            },
          ],
        },
      ],
    };
    expect(() => validateLock(lock, workspace)).toThrow(VersionLockValidationError);
  });
});
