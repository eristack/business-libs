export interface TokenStorage {
  getAccessToken(): string | null | Promise<string | null>;
  setAccessToken(token: string | null): void | Promise<void>;
  getRefreshToken(): string | null | Promise<string | null>;
  setRefreshToken(token: string | null): void | Promise<void>;
  getAccessTokenExpiresAt(): string | null | Promise<string | null>;
  setAccessTokenExpiresAt(iso: string | null): void | Promise<void>;
}

export function createMemoryTokenStorage(): TokenStorage {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let accessTokenExpiresAt: string | null = null;

  return {
    getAccessToken: () => accessToken,
    setAccessToken: (token) => {
      accessToken = token;
    },
    getRefreshToken: () => refreshToken,
    setRefreshToken: (token) => {
      refreshToken = token;
    },
    getAccessTokenExpiresAt: () => accessTokenExpiresAt,
    setAccessTokenExpiresAt: (iso) => {
      accessTokenExpiresAt = iso;
    },
  };
}

export function createLocalStorageTokenStorage(
  prefix = "eristack.jwt-auth",
): TokenStorage {
  const key = (suffix: string) => `${prefix}.${suffix}`;

  return {
    getAccessToken: () => localStorage.getItem(key("accessToken")),
    setAccessToken: (token) => {
      if (token == null) localStorage.removeItem(key("accessToken"));
      else localStorage.setItem(key("accessToken"), token);
    },
    getRefreshToken: () => localStorage.getItem(key("refreshToken")),
    setRefreshToken: (token) => {
      if (token == null) localStorage.removeItem(key("refreshToken"));
      else localStorage.setItem(key("refreshToken"), token);
    },
    getAccessTokenExpiresAt: () => localStorage.getItem(key("accessTokenExpiresAt")),
    setAccessTokenExpiresAt: (iso) => {
      if (iso == null) localStorage.removeItem(key("accessTokenExpiresAt"));
      else localStorage.setItem(key("accessTokenExpiresAt"), iso);
    },
  };
}
