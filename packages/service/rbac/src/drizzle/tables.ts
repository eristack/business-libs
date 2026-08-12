export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

import {
  pgTable,
  text as pgText,
  primaryKey as pgPrimaryKey,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  primaryKey as mysqlPrimaryKey,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  primaryKey as sqlitePrimaryKey,
} from "drizzle-orm/sqlite-core";

/**
 * RBAC tables are children of your app users via `subject`.
 * Default names: rbac_permissions, rbac_roles, rbac_role_permissions,
 * rbac_subject_roles, rbac_subject_permissions.
 */
export function createRbacTables(dialect: DrizzleDialect, prefix = "rbac") {
  switch (dialect) {
    case "pgsql":
      return createPgsqlRbacTables(prefix);
    case "mysql":
      return createMysqlRbacTables(prefix);
    case "sqlite":
      return createSqliteRbacTables(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function createPgsqlRbacTables(prefix: string) {
  const permissions = pgTable(`${prefix}_permissions`, {
    name: pgText("name").primaryKey(),
    description: pgText("description"),
  });
  const roles = pgTable(`${prefix}_roles`, {
    name: pgText("name").primaryKey(),
    description: pgText("description"),
  });
  const rolePermissions = pgTable(
    `${prefix}_role_permissions`,
    {
      role: pgText("role").notNull(),
      permission: pgText("permission").notNull(),
    },
    (t) => [pgPrimaryKey({ columns: [t.role, t.permission] })],
  );
  const subjectRoles = pgTable(
    `${prefix}_subject_roles`,
    {
      subject: pgText("subject").notNull(),
      role: pgText("role").notNull(),
    },
    (t) => [pgPrimaryKey({ columns: [t.subject, t.role] })],
  );
  const subjectPermissions = pgTable(
    `${prefix}_subject_permissions`,
    {
      subject: pgText("subject").notNull(),
      permission: pgText("permission").notNull(),
    },
    (t) => [pgPrimaryKey({ columns: [t.subject, t.permission] })],
  );
  return {
    permissions,
    roles,
    rolePermissions,
    subjectRoles,
    subjectPermissions,
  };
}

function createMysqlRbacTables(prefix: string) {
  const permissions = mysqlTable(`${prefix}_permissions`, {
    name: mysqlVarchar("name", { length: 255 }).primaryKey(),
    description: mysqlVarchar("description", { length: 512 }),
  });
  const roles = mysqlTable(`${prefix}_roles`, {
    name: mysqlVarchar("name", { length: 255 }).primaryKey(),
    description: mysqlVarchar("description", { length: 512 }),
  });
  const rolePermissions = mysqlTable(
    `${prefix}_role_permissions`,
    {
      role: mysqlVarchar("role", { length: 255 }).notNull(),
      permission: mysqlVarchar("permission", { length: 255 }).notNull(),
    },
    (t) => [mysqlPrimaryKey({ columns: [t.role, t.permission] })],
  );
  const subjectRoles = mysqlTable(
    `${prefix}_subject_roles`,
    {
      subject: mysqlVarchar("subject", { length: 255 }).notNull(),
      role: mysqlVarchar("role", { length: 255 }).notNull(),
    },
    (t) => [mysqlPrimaryKey({ columns: [t.subject, t.role] })],
  );
  const subjectPermissions = mysqlTable(
    `${prefix}_subject_permissions`,
    {
      subject: mysqlVarchar("subject", { length: 255 }).notNull(),
      permission: mysqlVarchar("permission", { length: 255 }).notNull(),
    },
    (t) => [mysqlPrimaryKey({ columns: [t.subject, t.permission] })],
  );
  return {
    permissions,
    roles,
    rolePermissions,
    subjectRoles,
    subjectPermissions,
  };
}

function createSqliteRbacTables(prefix: string) {
  const permissions = sqliteTable(`${prefix}_permissions`, {
    name: sqliteText("name").primaryKey(),
    description: sqliteText("description"),
  });
  const roles = sqliteTable(`${prefix}_roles`, {
    name: sqliteText("name").primaryKey(),
    description: sqliteText("description"),
  });
  const rolePermissions = sqliteTable(
    `${prefix}_role_permissions`,
    {
      role: sqliteText("role").notNull(),
      permission: sqliteText("permission").notNull(),
    },
    (t) => [sqlitePrimaryKey({ columns: [t.role, t.permission] })],
  );
  const subjectRoles = sqliteTable(
    `${prefix}_subject_roles`,
    {
      subject: sqliteText("subject").notNull(),
      role: sqliteText("role").notNull(),
    },
    (t) => [sqlitePrimaryKey({ columns: [t.subject, t.role] })],
  );
  const subjectPermissions = sqliteTable(
    `${prefix}_subject_permissions`,
    {
      subject: sqliteText("subject").notNull(),
      permission: sqliteText("permission").notNull(),
    },
    (t) => [sqlitePrimaryKey({ columns: [t.subject, t.permission] })],
  );
  return {
    permissions,
    roles,
    rolePermissions,
    subjectRoles,
    subjectPermissions,
  };
}

export type RbacTables = ReturnType<typeof createRbacTables>;
