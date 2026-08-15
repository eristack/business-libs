import { registerRestLikeRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createEpoch } from "../core/create-epoch.js";
import type { Epoch, EpochConfig } from "../core/types.js";
import { createRestEpochActions } from "../rest/index.js";
import { createBackseatEpochStore } from "./epoch-store.js";

export type RegisterEpochBackseatOptions = Omit<EpochConfig, "store"> & {
  basePath?: string;
  epoch?: Epoch;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

export function registerEpochBackseat(
  api: Backseat,
  options: RegisterEpochBackseatOptions = {},
): Epoch {
  const store = createBackseatEpochStore(api.store);
  const epoch =
    options.epoch ??
    createEpoch({
      store,
      defaultIncrement: options.defaultIncrement,
    });
  const actions = createRestEpochActions({ epoch });
  const base = normalizeBasePath(options.basePath ?? "/epoch");

  registerRestLikeRoutes(api, [
    {
      method: "GET",
      path: `${base}/:scope`,
      name: "epoch.current",
      handler: (req) => actions.getCurrent(req),
    },
    {
      method: "POST",
      path: `${base}/:scope/bump`,
      name: "epoch.bump",
      handler: (req) => actions.bump(req),
    },
    {
      method: "GET",
      path: `${base}/:scope/cache-policy`,
      name: "epoch.cache-policy",
      handler: (req) => actions.resolveCachePolicy(req),
    },
  ]);

  api.registerAction("epoch.resolveCachePolicy", async ({ input }) => {
    const { scope, clientEpoch } = input as {
      scope: string;
      clientEpoch: number;
    };
    return epoch.resolveCachePolicy(scope, clientEpoch);
  });

  return epoch;
}

export { createBackseatEpochStore } from "./epoch-store.js";
export { EPOCH_COLLECTIONS, counterDocId } from "./collections.js";
