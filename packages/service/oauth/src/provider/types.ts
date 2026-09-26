export type RegisteredOAuthClient = {
  clientId: string;
  clientSecretHash?: string;
  redirectUris: string[];
  allowedScopes: string[];
  createdAt: string;
};

export type AuthorizationCodeRecord = {
  code: string;
  clientId: string;
  redirectUri: string;
  subject: string;
  scopes: string[];
  codeChallenge: string;
  expiresAt: string;
  createdAt: string;
};

export type IssuedAccessToken = {
  token: string;
  clientId: string;
  subject: string;
  scopes: string[];
  expiresAt: string;
  createdAt: string;
};

export type OAuthProviderStore = {
  saveClient(client: RegisteredOAuthClient): Promise<void>;
  getClient(clientId: string): Promise<RegisteredOAuthClient | null>;
  saveAuthorizationCode(record: AuthorizationCodeRecord): Promise<void>;
  consumeAuthorizationCode(code: string): Promise<AuthorizationCodeRecord | null>;
  saveAccessToken(record: IssuedAccessToken): Promise<void>;
  getAccessToken(token: string): Promise<IssuedAccessToken | null>;
};
