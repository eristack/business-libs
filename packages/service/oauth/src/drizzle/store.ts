import { eq } from "drizzle-orm";
import type { OAuthPendingLogin, OAuthPendingLoginStore } from "../core/types.js";
import type {
  AuthorizationCodeRecord,
  IssuedAccessToken,
  OAuthProviderStore,
  RegisteredOAuthClient,
} from "../provider/types.js";
import type { OAuthTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (...args: any[]) => any;
};

export function createDrizzleOAuthPendingStore(options: {
  db: Db;
  tables: OAuthTables;
}): OAuthPendingLoginStore {
  const t = options.tables.pendingLogins;

  return {
    async save(pending) {
      await options.db.insert(t).values({
        state: pending.state,
        provider: pending.provider,
        codeVerifier: pending.codeVerifier,
        redirectUri: pending.redirectUri,
        scopes: pending.scopes ?? null,
        metadataJson: pending.metadata ? JSON.stringify(pending.metadata) : null,
        createdAt: pending.createdAt,
        expiresAt: pending.expiresAt,
      });
    },
    async consume(state) {
      const rows = await options.db.select().from(t).where(eq(t.state, state)).limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      await options.db.delete(t).where(eq(t.state, state));
      if (new Date(String(row.expiresAt)).getTime() < Date.now()) return null;
      return {
        state: String(row.state),
        provider: String(row.provider),
        codeVerifier: String(row.codeVerifier),
        redirectUri: String(row.redirectUri),
        scopes: row.scopes ? String(row.scopes) : undefined,
        metadata: row.metadataJson
          ? (JSON.parse(String(row.metadataJson)) as Record<string, string>)
          : undefined,
        createdAt: String(row.createdAt),
        expiresAt: String(row.expiresAt),
      } satisfies OAuthPendingLogin;
    },
  };
}

export function createDrizzleOAuthProviderStore(options: {
  db: Db;
  tables: OAuthTables;
}): OAuthProviderStore {
  const { db, tables: t } = options;

  return {
    async saveClient(client) {
      await db.insert(t.providerClients).values({
        clientId: client.clientId,
        clientSecretHash: client.clientSecretHash ?? null,
        redirectUrisJson: JSON.stringify(client.redirectUris),
        allowedScopesJson: JSON.stringify(client.allowedScopes),
        createdAt: client.createdAt,
      });
    },
    async getClient(clientId) {
      const rows = await db
        .select()
        .from(t.providerClients)
        .where(eq(t.providerClients.clientId, clientId))
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return {
        clientId: String(row.clientId),
        clientSecretHash: row.clientSecretHash ? String(row.clientSecretHash) : undefined,
        redirectUris: JSON.parse(String(row.redirectUrisJson)) as string[],
        allowedScopes: JSON.parse(String(row.allowedScopesJson)) as string[],
        createdAt: String(row.createdAt),
      } satisfies RegisteredOAuthClient;
    },
    async saveAuthorizationCode(record) {
      await db.insert(t.providerCodes).values({
        code: record.code,
        clientId: record.clientId,
        redirectUri: record.redirectUri,
        subject: record.subject,
        scopesJson: JSON.stringify(record.scopes),
        codeChallenge: record.codeChallenge,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
      });
    },
    async consumeAuthorizationCode(code) {
      const rows = await db
        .select()
        .from(t.providerCodes)
        .where(eq(t.providerCodes.code, code))
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      await db.delete(t.providerCodes).where(eq(t.providerCodes.code, code));
      if (new Date(String(row.expiresAt)).getTime() < Date.now()) return null;
      return {
        code: String(row.code),
        clientId: String(row.clientId),
        redirectUri: String(row.redirectUri),
        subject: String(row.subject),
        scopes: JSON.parse(String(row.scopesJson)) as string[],
        codeChallenge: String(row.codeChallenge),
        createdAt: String(row.createdAt),
        expiresAt: String(row.expiresAt),
      } satisfies AuthorizationCodeRecord;
    },
    async saveAccessToken(record) {
      await db.insert(t.providerTokens).values({
        token: record.token,
        clientId: record.clientId,
        subject: record.subject,
        scopesJson: JSON.stringify(record.scopes),
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
      });
    },
    async getAccessToken(token) {
      const rows = await db
        .select()
        .from(t.providerTokens)
        .where(eq(t.providerTokens.token, token))
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      if (new Date(String(row.expiresAt)).getTime() < Date.now()) return null;
      return {
        token: String(row.token),
        clientId: String(row.clientId),
        subject: String(row.subject),
        scopes: JSON.parse(String(row.scopesJson)) as string[],
        createdAt: String(row.createdAt),
        expiresAt: String(row.expiresAt),
      } satisfies IssuedAccessToken;
    },
  };
}
