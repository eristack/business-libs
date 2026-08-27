import {
  registerMountedRoutes,
  requireParam,
} from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { calculateLine, patchLine } from "../core/calculate.js";
import { createQups, type CreateQupsOptions, type QupsApi } from "../core/create-qups.js";
import { createBackseatPricingLineStore, createBackseatPricingProfileStore } from "./stores.js";

export type RegisterQupsBackseatOptions = CreateQupsOptions & {
  basePath?: string;
  qups?: QupsApi;
};

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
  const base = options.basePath ?? "/qups";

  registerMountedRoutes(api, base, [
    {
      method: "POST",
      segment: "/calculate-line",
      name: "qups.calculate-line",
      handler: async (ctx) => {
        const body = ctx.json<Record<string, unknown>>();
        const result = calculateLine(body as Parameters<typeof calculateLine>[0]);
        return { status: 200, body: result };
      },
    },
    {
      method: "POST",
      segment: "/patch-line",
      name: "qups.patch-line",
      handler: async (ctx) => {
        const body = ctx.json<{
          current: Parameters<typeof patchLine>[0];
          patch: Parameters<typeof patchLine>[1];
        }>();
        const result = patchLine(body.current, body.patch);
        return { status: 200, body: result };
      },
    },
    {
      method: "GET",
      segment: "/lines/:ownerKey",
      name: "qups.list-lines",
      handler: async (ctx) => {
        const ownerKey = requireParam(ctx.params.ownerKey, "ownerKey required");
        if (typeof ownerKey !== "string") return ownerKey;
        const items = await qups.listLines(ownerKey);
        return { status: 200, body: items };
      },
    },
  ]);

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
