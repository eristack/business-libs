import type { Backseat } from "@eristack/backseat";
import { calculateLine, patchLine } from "../core/calculate.js";
import { createQups, type CreateQupsOptions, type QupsApi } from "../core/create-qups.js";
import { createBackseatPricingLineStore, createBackseatPricingProfileStore } from "./stores.js";

export type RegisterQupsBackseatOptions = CreateQupsOptions & {
  basePath?: string;
  qups?: QupsApi;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

export function registerQupsBackseat(
  api: Backseat,
  options: RegisterQupsBackseatOptions = {},
): QupsApi {
  const profiles =
    options.profiles ?? createBackseatPricingProfileStore(api.store);
  const lines = options.lines ?? createBackseatPricingLineStore(api.store);
  const qups =
    options.qups ??
    createQups({
      profiles,
      lines,
      clock: options.clock,
      idFactory: options.idFactory,
    });
  const base = normalizeBasePath(options.basePath ?? "/qups");

  api.registerRoute({
    method: "POST",
    path: `${base}/calculate-line`,
    name: "qups.calculate-line",
    handler: async (ctx) => {
      const body = ctx.json<Record<string, unknown>>();
      const result = calculateLine(body as Parameters<typeof calculateLine>[0]);
      return { status: 200, body: result };
    },
  });

  api.registerRoute({
    method: "POST",
    path: `${base}/patch-line`,
    name: "qups.patch-line",
    handler: async (ctx) => {
      const body = ctx.json<{
        current: Parameters<typeof patchLine>[0];
        patch: Parameters<typeof patchLine>[1];
      }>();
      const result = patchLine(body.current, body.patch);
      return { status: 200, body: result };
    },
  });

  api.registerRoute({
    method: "GET",
    path: `${base}/lines/:ownerKey`,
    name: "qups.list-lines",
    handler: async (ctx) => {
      const ownerKey = ctx.params.ownerKey;
      if (!ownerKey) {
        return {
          status: 400,
          body: {
            error: {
              code: "VALIDATION_ERROR",
              message: "ownerKey required",
            },
          },
        };
      }
      const items = await qups.listLines(ownerKey);
      return { status: 200, body: items };
    },
  });

  api.registerAction("qups.calculateLine", async ({ input }) =>
    calculateLine(input as Parameters<typeof calculateLine>[0]),
  );

  return qups;
}

export {
  createBackseatPricingLineStore,
  createBackseatPricingProfileStore,
} from "./stores.js";
export { QUPS_COLLECTIONS } from "./collections.js";
