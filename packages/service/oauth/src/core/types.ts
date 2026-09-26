export type OAuthUserProfile = {
  provider: string;
  subject: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  raw: Record<string, unknown>;
};

export type IdpTokenSet = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
};

export type OAuthPendingLogin = {
  state: string;
  provider: string;
  codeVerifier: string;
  redirectUri: string;
  scopes?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  expiresAt: string;
};

export type OAuthPendingLoginStore = {
  save(pending: OAuthPendingLogin): Promise<void>;
  consume(state: string): Promise<OAuthPendingLogin | null>;
};

export type OAuthConsumerDriver = {
  provider: string;
  buildAuthorizationUrl(input: {
    redirectUri: string;
    state: string;
    codeChallenge: string;
    scopes?: string;
    loginHint?: string;
  }): string;
  exchangeAuthorizationCode(input: {
    code: string;
    redirectUri: string;
    codeVerifier: string;
  }): Promise<{ tokens: IdpTokenSet; profile: OAuthUserProfile }>;
};

export type OAuthConsumerConfig = {
  drivers: Record<string, OAuthConsumerDriver>;
  pendingStore: OAuthPendingLoginStore;
  allowedRedirectUris: readonly string[];
  pendingTtlSeconds?: number;
};

export type OAuthConsumer = {
  beginLogin(input: {
    provider: string;
    redirectUri: string;
    scopes?: string;
    loginHint?: string;
    metadata?: Record<string, string>;
  }): Promise<{ authorizationUrl: string; state: string }>;
  completeLogin(input: {
    provider: string;
    query: { code?: string; state?: string; error?: string; error_description?: string };
  }): Promise<{ profile: OAuthUserProfile; tokens: IdpTokenSet; metadata?: Record<string, string> }>;
};
