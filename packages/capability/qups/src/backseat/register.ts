import { registerMountedRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { calculateLine } from "../core/calculate.js";
import { createQups, type CreateQupsOptions, type QupsApi } from "../core/create-qups.js";
import { createQupsRoutes } from "./qups-routes.js";
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

  registerMountedRoutes(api, options.basePath ?? "/qups", createQupsRoutes(qups));

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
