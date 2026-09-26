import type { CreateIntentBody, PaymentIntentBody } from "../rest/types.js";

export type PaymentManagerClientConfig = {
  baseUrl: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
};

async function requestJson<T>(
  config: PaymentManagerClientConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const fetchFn = config.fetch ?? fetch;
  const res = await fetchFn(`${config.baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...config.headers,
      ...init?.headers,
    },
  });
  const body = (await res.json()) as T & { code?: string; message?: string };
  if (!res.ok) {
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return body;
}

export function createPaymentManagerClient(config: PaymentManagerClientConfig) {
  return {
    async createIntent(input: CreateIntentBody): Promise<PaymentIntentBody> {
      return requestJson(config, "/intents", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    async getIntent(id: string): Promise<PaymentIntentBody> {
      return requestJson(config, `/intents/${encodeURIComponent(id)}`);
    },
    async listIntents(query?: { ownerId?: string; status?: string }): Promise<{
      items: PaymentIntentBody[];
    }> {
      const params = new URLSearchParams();
      if (query?.ownerId) params.set("ownerId", query.ownerId);
      if (query?.status) params.set("status", query.status);
      const qs = params.toString();
      return requestJson(config, `/intents${qs ? `?${qs}` : ""}`);
    },
    async cancelIntent(id: string): Promise<PaymentIntentBody> {
      return requestJson(config, `/intents/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
        body: "{}",
      });
    },
  };
}

export type PaymentManagerClient = ReturnType<typeof createPaymentManagerClient>;
