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
  findById(id: string): Promise<RefreshTokenRecord | null>;
  /** Active (non-revoked, non-expired) refresh tips for a subject. */
  listActiveBySubject(subject: string, now: Date): Promise<RefreshTokenRecord[]>;
  revoke(id: string, revokedAt: Date): Promise<void>;
  revokeFamily(familyId: string, revokedAt: Date): Promise<void>;
  revokeAllForSubject(subject: string, revokedAt: Date): Promise<void>;
  markReplaced(
    id: string,
    replacedByTokenId: string,
    revokedAt: Date,
  ): Promise<void>;
}

/**
 * Login credentials row. This is a **child of the app's users table**
 * (`subject` = user id) — never a replacement for `users`.
 */
export interface CredentialRecord {
  id: string;
  /** App user id (FK to the application's users table). */
  subject: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  disabledAt: Date | null;
}

export interface CredentialStore {
  save(record: CredentialRecord): Promise<void>;
  findByUsername(username: string): Promise<CredentialRecord | null>;
  findBySubject(subject: string): Promise<CredentialRecord | null>;
  updatePasswordHash(
    id: string,
    passwordHash: string,
    updatedAt: Date,
  ): Promise<void>;
  disable(id: string, disabledAt: Date): Promise<void>;
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
  /** Current refresh-token record id (safe to show in session lists). */
  sessionId: string;
}

/** Safe session view — never includes refresh token plaintext or hash. */
export interface AuthSession {
  id: string;
  familyId: string;
  createdAt: Date;
  expiresAt: Date;
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

export interface RegisterCredentialsInput {
  /** Existing app user id — credentials are a child of users, not users themselves. */
  subject: string;
  username: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
  /** Extra claims merged into the issued access token. */
  claims?: JwtClaims;
}

export interface ChangePasswordInput {
  subject: string;
  currentPassword: string;
  newPassword: string;
}

export interface JwtAuth {
  issueTokens(input: IssueTokensInput): Promise<TokenPair>;
  verifyAccessToken(accessToken: string): Promise<VerifiedAccessToken>;
  refresh(refreshToken: string): Promise<TokenPair>;
  revoke(refreshToken: string): Promise<void>;
  revokeAllForSubject(subject: string): Promise<void>;
  /** Active sessions (refresh tips) for a subject. */
  listSessions(subject: string): Promise<AuthSession[]>;
  /**
   * Revoke a session by record id. `subject` must own the session.
   * Revokes the entire refresh family (device/session).
   */
  revokeSession(input: { sessionId: string; subject: string }): Promise<void>;
  /**
   * Attach username/password credentials to an existing user (`subject`).
   * Requires `credentials` store in config.
   */
  registerCredentials(input: RegisterCredentialsInput): Promise<void>;
  /** Verify username/password and issue a token pair. */
  login(input: LoginInput): Promise<TokenPair>;
  changePassword(input: ChangePasswordInput): Promise<void>;
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
  /**
   * Optional username/password credential store (child of app users).
   * Required for `login` / `registerCredentials` / `changePassword`.
   */
  credentials?: CredentialStore;
  clock?: Clock;
  issuer?: string;
  audience?: string | string[];
  /** Extra claims always merged into access tokens. */
  defaultClaims?: JwtClaims;
}
