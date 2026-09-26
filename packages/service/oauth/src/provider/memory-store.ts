import type {
  AuthorizationCodeRecord,
  IssuedAccessToken,
  OAuthProviderStore,
  RegisteredOAuthClient,
} from "./types.js";

export function createMemoryOAuthProviderStore(): OAuthProviderStore {
  const clients = new Map<string, RegisteredOAuthClient>();
  const codes = new Map<string, AuthorizationCodeRecord>();
  const tokens = new Map<string, IssuedAccessToken>();

  return {
    async saveClient(client) {
      clients.set(client.clientId, client);
    },
    async getClient(clientId) {
      return clients.get(clientId) ?? null;
    },
    async saveAuthorizationCode(record) {
      codes.set(record.code, record);
    },
    async consumeAuthorizationCode(code) {
      const row = codes.get(code);
      if (!row) return null;
      codes.delete(code);
      if (new Date(row.expiresAt).getTime() < Date.now()) return null;
      return row;
    },
    async saveAccessToken(record) {
      tokens.set(record.token, record);
    },
    async getAccessToken(token) {
      const row = tokens.get(token);
      if (!row) return null;
      if (new Date(row.expiresAt).getTime() < Date.now()) return null;
      return row;
    },
  };
}
