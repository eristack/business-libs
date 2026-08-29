import { describe, expect, it } from "vitest";
import { createMemoryRbacStore, createRbac, importRolesFromYaml } from "../src/index.js";

const SAMPLE = `
permissions:
  - name: orders.read
roles:
  - name: clerk
    permissions:
      - orders.read
      - orders.create
  - name: admin
    permissions:
      - orders.read
      - orders.create
`;

describe("importRolesFromYaml", () => {
  it("defines permissions and roles from YAML", async () => {
    const rbac = createRbac({ store: createMemoryRbacStore() });
    const summary = await importRolesFromYaml(rbac, SAMPLE);
    expect(summary.roles).toBe(2);
    expect(summary.permissions).toBe(2);
    expect(await rbac.can("user_1", "orders.read")).toBe(false);
    await rbac.assignRole({ subject: "user_1", role: "clerk" });
    expect(await rbac.can("user_1", "orders.read")).toBe(true);
    expect(await rbac.can("user_1", "orders.create")).toBe(true);
  });
});
