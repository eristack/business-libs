export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

export interface RefreshTokenTableColumns {
  id: unknown;
  subject: unknown;
  tokenHash: unknown;
  familyId: unknown;
  expiresAt: unknown;
  revokedAt: unknown;
  createdAt: unknown;
  replacedByTokenId: unknown;
  claims: unknown;
}
