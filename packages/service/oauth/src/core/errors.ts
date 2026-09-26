export class OAuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "OAuthError";
    this.code = code;
  }
}

export class InvalidRedirectUriError extends OAuthError {
  constructor(message: string) {
    super("INVALID_REDIRECT_URI", message);
    this.name = "InvalidRedirectUriError";
  }
}

export class UnknownOAuthProviderError extends OAuthError {
  constructor(provider: string) {
    super("UNKNOWN_OAUTH_PROVIDER", `No OAuth driver for provider: ${provider}`);
    this.name = "UnknownOAuthProviderError";
  }
}

export class OAuthStateError extends OAuthError {
  constructor(message: string) {
    super("OAUTH_STATE_INVALID", message);
    this.name = "OAuthStateError";
  }
}

export class OAuthExchangeError extends OAuthError {
  constructor(message: string) {
    super("OAUTH_EXCHANGE_FAILED", message);
    this.name = "OAuthExchangeError";
  }
}

export class OAuthProviderError extends OAuthError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = "OAuthProviderError";
  }
}
