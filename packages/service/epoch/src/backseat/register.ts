import { normalizeBasePath, registerRestLikeRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createEpoch } from "../core/create-epoch.js";
import type { Epoch, EpochConfig } from "../core/types.js";
import { createRestEpochActions } from "../rest/index.js";
import { createBackseatEpochStore } from "./epoch-store.js";
import { createEpochRestRoutes } from "./epoch-routes.js";

export type RegisterEpochBackseatOptions = Omit<EpochConfig, "store"> & {
  basePath?: string;
  epoch?: Epoch;
};

export function registerEpochBackseat(
  api: Backseat,
  options: RegisterEpochBackseatOptions = {},
): Epoch {
  const epoch =
    options.epoch ??
    createEpoch({
      store: createBackseatEpochStore(api.store),
      defaultIncrement: options.defaultIncrement,
    });
  const actions = createRestEpochActions({ epoch });
  const base = normalizeBasePath(options.basePath ?? "/epoch");

  registerRestLikeRoutes(api, createEpochRestRoutes(base, actions));

  api.registerAction("epoch.resolveCachePolicy", async ({ input }) => {
    const { scope, clientEpoch } = input as { scope: string; clientEpoch: number };
    return epoch.resolveCachePolicy(scope, clientEpoch);
  });

  return epoch;
}

export { createBackseatEpochStore } from "./epoch-store.js";
export { EPOCH_COLLECTIONS, counterDocId } from "./collections.js";
