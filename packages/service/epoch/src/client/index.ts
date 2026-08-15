import type {
  CachePolicy,
  CachePolicyResult,
  EpochScope,
  EpochValue,
} from "../core/types.js";

export type MaybeAsync<T> = T | Promise<T>;

export type EpochClientConfig = {
  baseUrl: string | (() => MaybeAsync<string>);
  fetch?: typeof fetch;
  getHeaders?: (() => MaybeAsync<Record<string, string>>) | Record<string, string>;
  credentials?: RequestCredentials | (() => MaybeAsync<RequestCredentials>);
  /** Path prefix. Default `/epoch`. */
  basePath?: string;
};

export type EpochClient = {
  current(scope: EpochScope): Promise<EpochValue>;
  bump(
    scope: EpochScope,
    input?: { expected?: EpochValue; by?: number },
  ): Promise<EpochValue>;
  resolveCachePolicy(
    scope: EpochScope,
    clientEpoch: EpochValue,
  ): Promise<CachePolicyResult>;
  /** Local-only compare when you already have server epoch from another response. */
  compare(clientEpoch: EpochValue, serverEpoch: EpochValue): CachePolicy;
};

async function resolveConfig<T>(value: T | (() => MaybeAsync<T>)): Promise<T> {
  if (typeof value === "function") {
    return await (value as () => MaybeAsync<T>)();
  }
  return await value;
}

export function createEpochClient(config: EpochClientConfig): EpochClient {
  const fetchImpl = config.fetch ?? fetch;
  const basePath = (config.basePath ?? "/epoch").replace(/\/$/, "");

  async function request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const baseUrlRaw = await resolveConfig(config.baseUrl);
    const baseUrl = baseUrlRaw.replace(/\/$/, "");
    const headers = {
      "content-type": "application/json",
      ...(await resolveConfig(config.getHeaders ?? {})),
      ...init?.headers,
    };
    const credentials = await resolveConfig(
      config.credentials ?? "same-origin",
    );
    const res = await fetchImpl(`${baseUrl}${basePath}${path}`, {
      ...init,
      headers,
      credentials,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      throw new Error(body.error?.message ?? `Epoch request failed (${res.status})`);
    }
    return (await res.json()) as T;
  }

  return {
    compare(clientEpoch, serverEpoch) {
      return clientEpoch === serverEpoch ? "use-cache" : "refetch";
    },

    async current(scope) {
      const body = await request<{ value: EpochValue }>(
        `/${encodeURIComponent(scope)}`,
      );
      return body.value;
    },

    async bump(scope, input) {
      const body = await request<{ value: EpochValue }>(
        `/${encodeURIComponent(scope)}/bump`,
        {
          method: "POST",
          body: JSON.stringify(input ?? {}),
        },
      );
      return body.value;
    },

    async resolveCachePolicy(scope, clientEpoch) {
      const qs = new URLSearchParams({
        clientEpoch: String(clientEpoch),
      });
      return request<CachePolicyResult>(
        `/${encodeURIComponent(scope)}/cache-policy?${qs}`,
      );
    },
  };
}
