import { describe, expect, it, afterEach } from "vitest";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import { createRbac } from "../src/index.js";
import {
  createDrizzleRbacStore,
  createRbacTables,
} from "../src/drizzle/index.js";

const RBAC_DDL = [
  `CREATE TABLE rbac_permissions (
    name TEXT PRIMARY KEY,
    description TEXT
  )`,
  `CREATE TABLE rbac_roles (
    name TEXT PRIMARY KEY,
    description TEXT
  )`,
  `CREATE TABLE rbac_role_permissions (
    role TEXT NOT NULL,
    permission TEXT NOT NULL,
    PRIMARY KEY (role, permission)
  )`,
  `CREATE TABLE rbac_subject_roles (
    subject TEXT NOT NULL,
    role TEXT NOT NULL,
    PRIMARY KEY (subject, role)
  )`,
  `CREATE TABLE rbac_subject_permissions (
    subject TEXT NOT NULL,
    permission TEXT NOT NULL,
    PRIMARY KEY (subject, permission)
  )`,
];

describe.skipIf(!canUseBetterSqlite())("rbac drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("assignRole + can() via Drizzle store", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, RBAC_DDL);

    const tables = createRbacTables("sqlite");
    const rbac = createRbac({
      store: createDrizzleRbacStore({ db: dbHandle.db, tables }),
    });

    await rbac.definePermission({ name: "orders.read" });
    await rbac.definePermission({ name: "orders.create" });
    await rbac.defineRole({
      name: "clerk",
      permissions: ["orders.read", "orders.create"],
    });

    await rbac.assignRole({ subject: "user_1", role: "clerk" });

    expect(await rbac.can("user_1", "orders.create")).toBe(true);
    expect(await rbac.can("user_1", "orders.read")).toBe(true);
    expect(await rbac.can("user_1", "orders.approve")).toBe(false);
  });
});
