import { registerMountedRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createPbac } from "../core/create-pbac.js";
import type { Pbac, PbacInput } from "../core/types.js";
import { createPbacRoutes } from "./pbac-routes.js";

export type RegisterPbacBackseatOptions = {
  basePath?: string;
  pbac?: Pbac;
};

/** Register PBAC check/authorize routes on Backseat. Policies remain code-registered. */
export function registerPbacBackseat(
  api: Backseat,
  options: RegisterPbacBackseatOptions = {},
): Pbac {
  const pbac = options.pbac ?? createPbac();
  registerMountedRoutes(api, options.basePath ?? "/pbac", createPbacRoutes(pbac));

  api.registerAction("pbac.check", async ({ input }) => {
    const { policyId, document } = input as {
      policyId: string;
      document: PbacInput;
    };
    return pbac.check(policyId, document);
  });

  return pbac;
}
