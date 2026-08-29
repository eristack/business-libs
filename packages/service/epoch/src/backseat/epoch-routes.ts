import { joinRoutePath } from "@eristack/backseat/adapters";
import { createRestEpochActions } from "../rest/index.js";

type EpochActions = ReturnType<typeof createRestEpochActions>;

export function createEpochRestRoutes(base: string, actions: EpochActions) {
  return [
    {
      method: "GET" as const,
      path: joinRoutePath(base, "/:scope"),
      name: "epoch.current",
      handler: (req: Parameters<EpochActions["getCurrent"]>[0]) => actions.getCurrent(req),
    },
    {
      method: "POST" as const,
      path: joinRoutePath(base, "/:scope/bump"),
      name: "epoch.bump",
      handler: (req: Parameters<EpochActions["bump"]>[0]) => actions.bump(req),
    },
    {
      method: "GET" as const,
      path: joinRoutePath(base, "/:scope/cache-policy"),
      name: "epoch.cache-policy",
      handler: (req: Parameters<EpochActions["resolveCachePolicy"]>[0]) =>
        actions.resolveCachePolicy(req),
    },
  ];
}
