import { createBackseat, createMemoryBackseatStore, type Backseat } from "@eristack/backseat";
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createBackseatJwtAuthStores,
  registerJwtAuthBackseat,
} from "@eristack/jwt-auth/backseat";
import { registerDataGridBackseatRoute } from "@eristack/data-grid/backseat";
import { registerEpochBackseat } from "@eristack/epoch/backseat";
import { createPbac, documents } from "@eristack/pbac";
import { registerPbacBackseat } from "@eristack/pbac/backseat";
import { registerQupsBackseat } from "@eristack/qups/backseat";

const DEMO_SECRETS = {
  accessSecret: "horizon-a-access-secret-min-32-chars!",
  refreshSecret: "horizon-a-refresh-secret-min-32-chars",
} as const;

export type HorizonSpine = {
  api: Backseat;
  pbac: ReturnType<typeof createPbac>;
  epoch: ReturnType<typeof registerEpochBackseat>;
  jwtAuth: ReturnType<typeof createJwtAuth>;
};

/** Register Horizon A spine packages on one Backseat engine. */
export function createHorizonBackseat(): HorizonSpine {
  const store = createMemoryBackseatStore();
  const api = createBackseat({ store, baseUrl: "/api" });

  const pbac = createPbac();
  pbac.registerPolicy({
    id: "order.transition",
    evaluate: documents.transitions("status", {
      draft: ["submit"],
      submitted: ["approve", "cancel"],
      approved: [],
    }),
  });
  registerPbacBackseat(api, { basePath: "/pbac", pbac });

  const epoch = registerEpochBackseat(api, { basePath: "/epoch" });
  registerQupsBackseat(api, { basePath: "/qups" });

  const ordersGridSchema = {
    fields: [
      { name: "number", type: "string" as const, filterable: true, sortable: true },
      { name: "status", type: "string" as const, filterable: true },
      { name: "total", type: "decimal" as const, filterable: true, sortable: true },
      {
        name: "postedAt",
        type: "wall" as const,
        filterable: true,
        sortable: true,
      },
    ],
    defaultPageSize: 20,
    maxPageSize: 100,
  };

  registerDataGridBackseatRoute(api, {
    path: "/orders-grid",
    name: "orders.grid",
    schema: ordersGridSchema,
    load: async (query) => {
      const { executeBackseatList } = await import("@eristack/data-grid/backseat");
      return executeBackseatList({
        store: api.store,
        collection: "orders",
        schema: ordersGridSchema,
        query,
        toRow: async (doc) => ({
          number: String(doc.number ?? ""),
          status: String(doc.status ?? ""),
          total: String(doc.total ?? "0"),
          postedAt: String(doc.postedAt ?? "2026-01-15"),
        }),
      });
    },
  });

  const { credentials, refreshTokens } = createBackseatJwtAuthStores({ store });
  const jwtAuth = createJwtAuth({
    credentials,
    store: refreshTokens,
    ...DEMO_SECRETS,
  });
  registerJwtAuthBackseat(api, {
    basePath: "/auth",
    jwtAuth,
    refreshTokenTransport: "body",
  });

  return { api, pbac, epoch, jwtAuth };
}
