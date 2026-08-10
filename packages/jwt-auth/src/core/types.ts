export type JwtClaims = Record<string, unknown>;

export interface AccessTokenClaims extends JwtClaims {
  sub: string;
  iat: number;
  exp: number;
  jti?: string;
}

export interface RefreshTokenRecord {
  id: string;
  subject: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  replacedByTokenId: string | null;
  claims?: JwtClaims;
}

export interface RefreshTokenStore {
  save(record: RefreshTokenRecord): Promise<void>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revoke(id: string, revokedAt: Date): Promise<void>;
  revokeFamily(familyId: string, revokedAt: Date): Promise<void>;
  revokeAllForSubject(subject: string, revokedAt: Date): Promise<void>;
  markReplaced(
    id: string,
    replacedByTokenId: string,
    revokedAt: Date,
  ): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  tokenType: "Bearer";
}

export interface IssueTokensInput {
  subject: string;
  claims?: JwtClaims;
  /** Reuse an existing refresh family; omit to start a new family. */
  familyId?: string;
}

export interface VerifiedAccessToken {
  subject: string;
  claims: AccessTokenClaims;
  token: string;
}

export interface JwtAuth {
  issueTokens(input: IssueTokensInput): Promise<TokenPair>;
  verifyAccessToken(accessToken: string): Promise<VerifiedAccessToken>;
  refresh(refreshToken: string): Promise<TokenPair>;
  revoke(refreshToken: string): Promise<void>;
  revokeAllForSubject(subject: string): Promise<void>;
}

export type DurationInput =
  | number
  | `${number}${"ms" | "s" | "m" | "h" | "d"}`;

export interface JwtAuthConfig {
  /** Symmetric secret for HS256 access tokens. */
  accessSecret: string | Uint8Array;
  accessTokenTtl?: DurationInput;
  refreshTokenTtl?: DurationInput;
  store: RefreshTokenStore;
  clock?: Clock;
  issuer?: string;
  audience?: string | string[];
  /** Extra claims always merged into access tokens. */
  defaultClaims?: JwtClaims;
}
