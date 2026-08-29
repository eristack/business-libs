import { registerMountedRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createAbac } from "../core/create-abac.js";
import type { Abac, AbacContext } from "../core/types.js";
import { createAbacRoutes } from "./abac-routes.js";

export type RegisterAbacBackseatOptions = {
  basePath?: string;
  abac?: Abac;
};

/** Register ABAC evaluate/authorize routes on Backseat. Policies remain code-registered. */
export function registerAbacBackseat(
  api: Backseat,
  options: RegisterAbacBackseatOptions = {},
): Abac {
  const abac = options.abac ?? createAbac();
  registerMountedRoutes(api, options.basePath ?? "/abac", createAbacRoutes(abac));

  api.registerAction("abac.evaluate", async ({ input }) => {
    const { policyId, ctx } = input as { policyId: string; ctx: AbacContext };
    return abac.evaluate(policyId, ctx);
  });

  return abac;
}
