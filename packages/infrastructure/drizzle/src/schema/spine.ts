import { createBackseatDocumentTables } from "@eristack/backseat/drizzle";
import type { BackseatDocumentTables } from "@eristack/backseat/drizzle";
import {
  createDocNumberFormatTable,
  createDocNumberSequenceTable,
} from "@eristack/doc-number/drizzle";
import { createEpochTables, type EpochTables } from "@eristack/epoch/drizzle";
import {
  createCredentialsTable,
  createRefreshTokenTable,
  type AnyCredentialsTable,
  type AnyRefreshTokenTable,
  type DrizzleDialect,
} from "@eristack/jwt-auth/drizzle";
import { createRbacTables, type RbacTables } from "@eristack/rbac/drizzle";
import type { AppDbDialect } from "../dialect.js";

export type CreateEristackSpineTablesOptions = {
  dialect: AppDbDialect;
  /** Include `{prefix}_documents` for Drizzle-backed Backseat (Horizon B). */
  backseatDocuments?: boolean;
  prefixes?: {
    rbac?: string;
    epoch?: string;
    backseat?: string;
  };
};

export type EristackSpineTables = RbacTables &
  EpochTables & {
    jwtAuthRefreshTokens: AnyRefreshTokenTable;
    jwtAuthCredentials: AnyCredentialsTable;
    docNumberFormats: ReturnType<typeof createDocNumberFormatTable>;
    docNumberSequences: ReturnType<typeof createDocNumberSequenceTable>;
    backseatDocuments?: BackseatDocumentTables["documents"];
  };

/**
 * Compose jwt-auth, rbac, epoch, and doc-number tables for app `schema.ts`.
 * App still owns `users` and every business table — this is the shared spine only.
 */
export function createEristackSpineTables(
  options: CreateEristackSpineTablesOptions,
): EristackSpineTables {
  const { dialect: appDialect, backseatDocuments = false, prefixes = {} } = options;

  const jwtAuthRefreshTokens =
    appDialect === "pgsql"
      ? createRefreshTokenTable("pgsql")
      : createRefreshTokenTable("sqlite");
  const jwtAuthCredentials =
    appDialect === "pgsql"
      ? createCredentialsTable("pgsql")
      : createCredentialsTable("sqlite");
  const rbac = createRbacTables(appDialect as DrizzleDialect, prefixes.rbac ?? "rbac");
  const epoch = createEpochTables(appDialect as DrizzleDialect, prefixes.epoch ?? "epoch");
  const docNumberFormats =
    appDialect === "pgsql"
      ? createDocNumberFormatTable("pgsql")
      : createDocNumberFormatTable("sqlite");
  const docNumberSequences =
    appDialect === "pgsql"
      ? createDocNumberSequenceTable("pgsql")
      : createDocNumberSequenceTable("sqlite");

  const backseat = backseatDocuments
    ? createBackseatDocumentTables(appDialect, prefixes.backseat ?? "backseat")
    : undefined;

  return {
    jwtAuthRefreshTokens,
    jwtAuthCredentials,
    ...rbac,
    ...epoch,
    docNumberFormats,
    docNumberSequences,
    ...(backseat ? { backseatDocuments: backseat.documents } : {}),
  } as EristackSpineTables;
}
