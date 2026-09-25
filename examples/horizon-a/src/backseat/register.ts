import { createBackseat, createMemoryBackseatStore, type Backseat } from "@eristack/backseat";
import { registerHorizonDocumentSpine } from "@eristack/backseat/seeds";
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createBackseatJwtAuthStores,
} from "@eristack/jwt-auth/backseat";
import { registerDataGridBackseatRoute } from "@eristack/data-grid/backseat";
import { createPbac } from "@eristack/pbac";
import {
  publicationGraph,
  registerTransitionGraph,
} from "@eristack/doc-transitions";

const DEMO_SECRETS = {
  accessSecret: "horizon-a-access-secret-min-32-chars!",
  refreshSecret: "horizon-a-refresh-secret-min-32-chars",
} as const;

export type HorizonSpine = {
  api: Backseat;
  pbac: ReturnType<typeof createPbac>;
  epoch: Awaited<ReturnType<typeof registerHorizonDocumentSpine>>["epoch"];
  jwtAuth: ReturnType<typeof createJwtAuth>;
};

/** Register Horizon A spine packages on one Backseat engine. */
export async function createHorizonBackseat(): Promise<HorizonSpine> {
  const store = createMemoryBackseatStore();
  const api = createBackseat({ store, baseUrl: "/api" });

  const pbac = createPbac();
  const orderGraph = {
    ...publicationGraph,
    table: {
      draft: ["submit", "cancel"],
      submitted: ["approve", "cancel"],
      approved: [],
      cancelled: [],
    },
    terminal: ["approved", "cancelled"],
  };
  registerTransitionGraph(pbac, { entityKey: "order", graph: orderGraph });

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

  const { credentials, refreshTokens } = createBackseatJwtAuthStores({ store });
  const jwtAuth = createJwtAuth({
    credentials,
    store: refreshTokens,
    ...DEMO_SECRETS,
  });

  const { epoch } = await registerHorizonDocumentSpine(api, {
    pbac,
    jwt: { jwtAuth, basePath: "/auth", refreshTokenTransport: "body" },
    afterCore: async (backseat) => {
      registerDataGridBackseatRoute(backseat, {
        path: "/orders-grid",
        name: "orders.grid",
        schema: ordersGridSchema,
        load: async (query) => {
          const { executeBackseatList } = await import("@eristack/data-grid/backseat");
          return executeBackseatList({
            store: backseat.store,
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
    },
  });

  return { api, pbac, epoch, jwtAuth };
}
