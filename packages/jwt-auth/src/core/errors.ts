export class JwtAuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "JwtAuthError";
    this.code = code;
  }
}

export class InvalidAccessTokenError extends JwtAuthError {
  constructor(message = "Invalid or expired access token") {
    super("INVALID_ACCESS_TOKEN", message);
    this.name = "InvalidAccessTokenError";
  }
}

export class InvalidRefreshTokenError extends JwtAuthError {
  constructor(message = "Invalid or expired refresh token") {
    super("INVALID_REFRESH_TOKEN", message);
    this.name = "InvalidRefreshTokenError";
  }
}

export class RefreshTokenReuseError extends JwtAuthError {
  constructor(message = "Refresh token reuse detected; token family revoked") {
    super("REFRESH_TOKEN_REUSE", message);
    this.name = "RefreshTokenReuseError";
  }
}

export class ConfigurationError extends JwtAuthError {
  constructor(message: string) {
    super("CONFIGURATION_ERROR", message);
    this.name = "ConfigurationError";
  }
}
