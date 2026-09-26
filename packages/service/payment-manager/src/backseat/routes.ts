import { joinRoutePath, type RestLikeRequest } from "@eristack/backseat/adapters";
import type { createRestPaymentManagerActions } from "../rest/actions.js";
import type { RestRequest } from "../rest/types.js";

type PaymentManagerActions = ReturnType<typeof createRestPaymentManagerActions>;

function toRestRequest(req: RestLikeRequest): RestRequest {
  return {
    method: req.method ?? "GET",
    headers: {
      get(name: string) {
        return req.headers.get(name) ?? null;
      },
    },
    body: req.body,
    params: req.params as Record<string, string | undefined>,
    query: req.query as Record<string, string | string[] | undefined>,
  };
}

export function createPaymentManagerRestRoutes(
  base: string,
  actions: PaymentManagerActions,
) {
  return [
    {
      method: "POST" as const,
      path: joinRoutePath(base, "/intents"),
      name: "payment-manager.create-intent",
      handler: (req: RestLikeRequest) => actions.createIntent(toRestRequest(req)),
    },
    {
      method: "GET" as const,
      path: joinRoutePath(base, "/intents"),
      name: "payment-manager.list-intents",
      handler: (req: RestLikeRequest) => actions.listIntents(toRestRequest(req)),
    },
    {
      method: "GET" as const,
      path: joinRoutePath(base, "/intents/:id"),
      name: "payment-manager.get-intent",
      handler: (req: RestLikeRequest) => actions.getIntent(toRestRequest(req)),
    },
    {
      method: "POST" as const,
      path: joinRoutePath(base, "/intents/:id/cancel"),
      name: "payment-manager.cancel-intent",
      handler: (req: RestLikeRequest) => actions.cancelIntent(toRestRequest(req)),
    },
    {
      method: "POST" as const,
      path: joinRoutePath(base, "/webhooks/:gateway"),
      name: "payment-manager.webhook",
      handler: (req: RestLikeRequest) => actions.handleWebhook(toRestRequest(req)),
    },
  ];
}
