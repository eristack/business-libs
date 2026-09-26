export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  text as mysqlText,
  datetime as mysqlDatetime,
} from "drizzle-orm/mysql-core";
import { sqliteTable, text as sqliteText } from "drizzle-orm/sqlite-core";

export function createOAuthTables(dialect: DrizzleDialect, prefix = "oauth") {
  switch (dialect) {
    case "pgsql":
      return createPgsql(prefix);
    case "mysql":
      return createMysql(prefix);
    case "sqlite":
      return createSqlite(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

export type OAuthTables = ReturnType<typeof createOAuthTables>;

function createPgsql(prefix: string) {
  const pendingLogins = pgTable(`${prefix}_pending_logins`, {
    state: pgText("state").primaryKey(),
    provider: pgText("provider").notNull(),
    codeVerifier: pgText("code_verifier").notNull(),
    redirectUri: pgText("redirect_uri").notNull(),
    scopes: pgText("scopes"),
    metadataJson: pgText("metadata_json"),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: pgTimestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
  });

  const providerClients = pgTable(`${prefix}_provider_clients`, {
    clientId: pgText("client_id").primaryKey(),
    clientSecretHash: pgText("client_secret_hash"),
    redirectUrisJson: pgText("redirect_uris_json").notNull(),
    allowedScopesJson: pgText("allowed_scopes_json").notNull(),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
  });

  const providerCodes = pgTable(`${prefix}_provider_authorization_codes`, {
    code: pgText("code").primaryKey(),
    clientId: pgText("client_id").notNull(),
    redirectUri: pgText("redirect_uri").notNull(),
    subject: pgText("subject").notNull(),
    scopesJson: pgText("scopes_json").notNull(),
    codeChallenge: pgText("code_challenge").notNull(),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: pgTimestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
  });

  const providerTokens = pgTable(`${prefix}_provider_access_tokens`, {
    token: pgText("token").primaryKey(),
    clientId: pgText("client_id").notNull(),
    subject: pgText("subject").notNull(),
    scopesJson: pgText("scopes_json").notNull(),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: pgTimestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
  });

  return { pendingLogins, providerClients, providerCodes, providerTokens };
}

function createMysql(prefix: string) {
  const pendingLogins = mysqlTable(`${prefix}_pending_logins`, {
    state: mysqlVarchar("state", { length: 64 }).primaryKey(),
    provider: mysqlVarchar("provider", { length: 64 }).notNull(),
    codeVerifier: mysqlText("code_verifier").notNull(),
    redirectUri: mysqlText("redirect_uri").notNull(),
    scopes: mysqlText("scopes"),
    metadataJson: mysqlText("metadata_json"),
    createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
    expiresAt: mysqlDatetime("expires_at", { mode: "string" }).notNull(),
  });
  const providerClients = mysqlTable(`${prefix}_provider_clients`, {
    clientId: mysqlVarchar("client_id", { length: 128 }).primaryKey(),
    clientSecretHash: mysqlText("client_secret_hash"),
    redirectUrisJson: mysqlText("redirect_uris_json").notNull(),
    allowedScopesJson: mysqlText("allowed_scopes_json").notNull(),
    createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
  });
  const providerCodes = mysqlTable(`${prefix}_provider_authorization_codes`, {
    code: mysqlVarchar("code", { length: 128 }).primaryKey(),
    clientId: mysqlVarchar("client_id", { length: 128 }).notNull(),
    redirectUri: mysqlText("redirect_uri").notNull(),
    subject: mysqlVarchar("subject", { length: 255 }).notNull(),
    scopesJson: mysqlText("scopes_json").notNull(),
    codeChallenge: mysqlText("code_challenge").notNull(),
    createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
    expiresAt: mysqlDatetime("expires_at", { mode: "string" }).notNull(),
  });
  const providerTokens = mysqlTable(`${prefix}_provider_access_tokens`, {
    token: mysqlVarchar("token", { length: 128 }).primaryKey(),
    clientId: mysqlVarchar("client_id", { length: 128 }).notNull(),
    subject: mysqlVarchar("subject", { length: 255 }).notNull(),
    scopesJson: mysqlText("scopes_json").notNull(),
    createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
    expiresAt: mysqlDatetime("expires_at", { mode: "string" }).notNull(),
  });
  return { pendingLogins, providerClients, providerCodes, providerTokens };
}

function createSqlite(prefix: string) {
  const pendingLogins = sqliteTable(`${prefix}_pending_logins`, {
    state: sqliteText("state").primaryKey(),
    provider: sqliteText("provider").notNull(),
    codeVerifier: sqliteText("code_verifier").notNull(),
    redirectUri: sqliteText("redirect_uri").notNull(),
    scopes: sqliteText("scopes"),
    metadataJson: sqliteText("metadata_json"),
    createdAt: sqliteText("created_at").notNull(),
    expiresAt: sqliteText("expires_at").notNull(),
  });
  const providerClients = sqliteTable(`${prefix}_provider_clients`, {
    clientId: sqliteText("client_id").primaryKey(),
    clientSecretHash: sqliteText("client_secret_hash"),
    redirectUrisJson: sqliteText("redirect_uris_json").notNull(),
    allowedScopesJson: sqliteText("allowed_scopes_json").notNull(),
    createdAt: sqliteText("created_at").notNull(),
  });
  const providerCodes = sqliteTable(`${prefix}_provider_authorization_codes`, {
    code: sqliteText("code").primaryKey(),
    clientId: sqliteText("client_id").notNull(),
    redirectUri: sqliteText("redirect_uri").notNull(),
    subject: sqliteText("subject").notNull(),
    scopesJson: sqliteText("scopes_json").notNull(),
    codeChallenge: sqliteText("code_challenge").notNull(),
    createdAt: sqliteText("created_at").notNull(),
    expiresAt: sqliteText("expires_at").notNull(),
  });
  const providerTokens = sqliteTable(`${prefix}_provider_access_tokens`, {
    token: sqliteText("token").primaryKey(),
    clientId: sqliteText("client_id").notNull(),
    subject: sqliteText("subject").notNull(),
    scopesJson: sqliteText("scopes_json").notNull(),
    createdAt: sqliteText("created_at").notNull(),
    expiresAt: sqliteText("expires_at").notNull(),
  });
  return { pendingLogins, providerClients, providerCodes, providerTokens };
}
