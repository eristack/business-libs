import {
  createMemoryTokenStorage,
  type TokenStorage,
} from "./storage.js";

export type AuthStatus = "unknown" | "authenticated" | "anonymous";

export interface JwtAuthClientState {
  status: AuthStatus;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
}

export interface TokenPairResponse {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  tokenType: "Bearer";
}

export interface JwtAuthClientConfig {
  baseUrl: string;
  storage?: TokenStorage;
  refreshPath?: string;
  logoutPath?: string;
  logoutAllPath?: string;
  issuePath?: string;
  /** Refresh this many ms before access token expiry. Default 60_000. */
  refreshSkewMs?: number;
  fetch?: typeof fetch;
  /** When true (default), send credentials for cookie-based refresh. */
  credentials?: RequestCredentials;
}

export interface JwtAuthClient {
  getState(): JwtAuthClientState;
  subscribe(listener: (state: JwtAuthClientState) => void): () => void;
  getAccessToken(): Promise<string | null>;
  /** Persist tokens from an app-owned login response. */
  acceptTokenPair(pair: TokenPairResponse): Promise<void>;
  issue(input: { subject: string; claims?: Record<string, unknown> }): Promise<TokenPairResponse>;
  refresh(): Promise<TokenPairResponse>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  /** Ensures a non-expired access token is available, refreshing if needed. */
  ensureAccessToken(): Promise<string | null>;
  dispose(): void;
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function createJwtAuthClient(config: JwtAuthClientConfig): JwtAuthClient {
  const storage = config.storage ?? createMemoryTokenStorage();
  const fetchImpl = config.fetch ?? fetch;
  const refreshSkewMs = config.refreshSkewMs ?? 60_000;
  const credentials = config.credentials ?? "include";
  const listeners = new Set<(state: JwtAuthClientState) => void>();

  let state: JwtAuthClientState = {
    status: "unknown",
    accessToken: null,
    accessTokenExpiresAt: null,
  };
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;
  let refreshInFlight: Promise<TokenPairResponse> | null = null;

  function emit() {
    for (const listener of listeners) listener(state);
  }

  function setState(next: JwtAuthClientState) {
    state = next;
    emit();
  }

  function clearRefreshTimer() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  }

  function scheduleRefresh(expiresAtIso: string | null) {
    clearRefreshTimer();
    if (!expiresAtIso) return;
    const expiresAt = Date.parse(expiresAtIso);
    if (Number.isNaN(expiresAt)) return;
    const delay = Math.max(expiresAt - Date.now() - refreshSkewMs, 0);
    refreshTimer = setTimeout(() => {
      void client.refresh().catch(() => {
        /* proactive refresh failures leave state as-is until next call */
      });
    }, delay);
  }

  async function persistPair(pair: TokenPairResponse): Promise<void> {
    await storage.setAccessToken(pair.accessToken);
    if (pair.refreshToken !== undefined) {
      await storage.setRefreshToken(pair.refreshToken);
    }
    await storage.setAccessTokenExpiresAt(pair.accessTokenExpiresAt);
    setState({
      status: "authenticated",
      accessToken: pair.accessToken,
      accessTokenExpiresAt: pair.accessTokenExpiresAt,
    });
    scheduleRefresh(pair.accessTokenExpiresAt);
  }

  async function clearSession(): Promise<void> {
    clearRefreshTimer();
    await storage.setAccessToken(null);
    await storage.setRefreshToken(null);
    await storage.setAccessTokenExpiresAt(null);
    setState({
      status: "anonymous",
      accessToken: null,
      accessTokenExpiresAt: null,
    });
  }

  async function parseJson(res: Response): Promise<unknown> {
    return res.json() as Promise<unknown>;
  }

  async function postJson(path: string, body?: unknown, accessToken?: string | null) {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await fetchImpl(joinUrl(config.baseUrl, path), {
      method: "POST",
      headers,
      credentials,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const data = await parseJson(res);
    if (!res.ok) {
      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        data.error &&
        typeof data.error === "object" &&
        "message" in data.error
          ? String((data.error as { message: unknown }).message)
          : `Request failed with ${res.status}`;
      throw new Error(message);
    }
    return data;
  }

  const client: JwtAuthClient = {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },

    async getAccessToken() {
      return (await storage.getAccessToken()) ?? null;
    },

    async acceptTokenPair(pair) {
      await persistPair(pair);
    },

    async issue(input) {
      const data = (await postJson(config.issuePath ?? "/auth/issue", input)) as TokenPairResponse;
      await persistPair(data);
      return data;
    },

    async refresh() {
      if (refreshInFlight) return refreshInFlight;

      refreshInFlight = (async () => {
        const refreshToken = await storage.getRefreshToken();
        const body = refreshToken ? { refreshToken } : {};
        const data = (await postJson(
          config.refreshPath ?? "/auth/refresh",
          body,
        )) as TokenPairResponse;
        await persistPair(data);
        return data;
      })();

      try {
        return await refreshInFlight;
      } finally {
        refreshInFlight = null;
      }
    },

    async logout() {
      const refreshToken = await storage.getRefreshToken();
      try {
        await postJson(config.logoutPath ?? "/auth/logout", refreshToken ? { refreshToken } : {});
      } finally {
        await clearSession();
      }
    },

    async logoutAll() {
      const accessToken = await storage.getAccessToken();
      try {
        await postJson(config.logoutAllPath ?? "/auth/logout-all", {}, accessToken);
      } finally {
        await clearSession();
      }
    },

    async ensureAccessToken() {
      const accessToken = await storage.getAccessToken();
      const expiresAt = await storage.getAccessTokenExpiresAt();
      if (!accessToken) {
        setState({
          status: "anonymous",
          accessToken: null,
          accessTokenExpiresAt: null,
        });
        return null;
      }

      const expiresMs = expiresAt ? Date.parse(expiresAt) : NaN;
      const needsRefresh =
        Number.isNaN(expiresMs) || expiresMs - Date.now() <= refreshSkewMs;

      if (!needsRefresh) {
        setState({
          status: "authenticated",
          accessToken,
          accessTokenExpiresAt: expiresAt,
        });
        scheduleRefresh(expiresAt);
        return accessToken;
      }

      try {
        const pair = await client.refresh();
        return pair.accessToken;
      } catch {
        await clearSession();
        return null;
      }
    },

    dispose() {
      clearRefreshTimer();
      listeners.clear();
    },
  };

  void (async () => {
    const accessToken = await storage.getAccessToken();
    const accessTokenExpiresAt = await storage.getAccessTokenExpiresAt();
    if (accessToken) {
      setState({
        status: "authenticated",
        accessToken,
        accessTokenExpiresAt,
      });
      scheduleRefresh(accessTokenExpiresAt);
    } else {
      setState({
        status: "anonymous",
        accessToken: null,
        accessTokenExpiresAt: null,
      });
    }
  })();

  return client;
}
