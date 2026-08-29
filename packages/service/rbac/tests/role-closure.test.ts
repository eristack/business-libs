import { describe, expect, it } from "vitest";
import {
  expandRolePermissions,
  RoleCycleError,
} from "../src/core/role-closure.js";

describe("expandRolePermissions", () => {
  it("includes inherited permissions", () => {
    const perms = expandRolePermissions(
      {
        admin: { permissions: ["settings.write"], inherits: ["clerk"] },
        clerk: { permissions: ["orders.read"] },
      },
      ["admin"],
    );
    expect([...perms].sort()).toEqual(["orders.read", "settings.write"]);
  });

  it("detects inheritance cycles", () => {
    expect(() =>
      expandRolePermissions(
        {
          a: { permissions: [], inherits: ["b"] },
          b: { permissions: [], inherits: ["a"] },
        },
        ["a"],
      ),
    ).toThrow(RoleCycleError);
  });
});
