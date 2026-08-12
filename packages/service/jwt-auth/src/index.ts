export { createJwtAuth } from "./core/create-jwt-auth.js";
export { createMemoryRefreshTokenStore } from "./core/memory-store.js";
export { createMemoryCredentialStore } from "./core/memory-credential-store.js";
export { hashPassword, verifyPassword } from "./core/password.js";
export { durationToMs } from "./core/duration.js";
export { generateId, generateOpaqueToken, hashToken } from "./core/crypto.js";
export { sessionDataGridSchema } from "./core/session-grid.js";
export {
  ConfigurationError,
  CredentialNotFoundError,
  InvalidAccessTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  JwtAuthError,
  RefreshTokenReuseError,
  SessionNotFoundError,
  UsernameTakenError,
} from "./core/errors.js";
export type {
  AccessTokenClaims,
  AuthSession,
  ChangePasswordInput,
  Clock,
  CredentialRecord,
  CredentialStore,
  DurationInput,
  IssueTokensInput,
  JwtAuth,
  JwtAuthConfig,
  JwtClaims,
  LoginInput,
  RefreshTokenRecord,
  RefreshTokenStore,
  RegisterCredentialsInput,
  TokenPair,
  VerifiedAccessToken,
} from "./core/types.js";
