import { describe, expect, it } from "vitest";
import {
  createMemoryRbacStore,
  createRbac,
  ForbiddenError,
} from "../src/index.js";

async function setup() {
  const rbac = createRbac({ store: createMemoryRbacStore() });
  await rbac.definePermission({ name: "orders.read" });
  await rbac.definePermission({ name: "orders.create" });
  await rbac.definePermission({ name: "orders.approve" });
  await rbac.defineRole({
    name: "clerk",
    permissions: ["orders.read", "orders.create"],
  });
  await rbac.defineRole({
    name: "manager",
    permissions: ["orders.read", "orders.create", "orders.approve"],
  });
  return rbac;
}

describe("rbac", () => {
  it("grants boolean permissions via roles", async () => {
    const rbac = await setup();
    await rbac.assignRole({ subject: "user_1", role: "clerk" });

    expect(await rbac.can("user_1", "orders.create")).toBe(true);
    expect(await rbac.can("user_1", "orders.approve")).toBe(false);
    expect(await rbac.canAny("user_1", ["orders.approve", "orders.read"])).toBe(
      true,
    );
    expect(
      await rbac.canAll("user_1", ["orders.read", "orders.create"]),
    ).toBe(true);
  });

  it("supports direct grants and authorize()", async () => {
    const rbac = await setup();
    await rbac.grantPermission({
      subject: "user_2",
      permission: "orders.approve",
    });
    expect(await rbac.can("user_2", "orders.approve")).toBe(true);
    await expect(
      rbac.authorize("user_2", "orders.create"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
