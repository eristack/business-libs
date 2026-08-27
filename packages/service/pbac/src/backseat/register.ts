import {
  registerMountedRoutes,
  requireParam,
} from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createPbac } from "../core/create-pbac.js";
import type { Pbac, PbacInput } from "../core/types.js";

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
  const base = options.basePath ?? "/pbac";

  registerMountedRoutes(api, base, [
    {
      method: "POST",
      segment: "/check/:policyId",
      name: "pbac.check",
      handler: async (ctx) => {
        const policyId = requireParam(ctx.params.policyId, "policyId required");
        if (typeof policyId !== "string") return policyId;
        const body = ctx.json<PbacInput>();
        const decision = await pbac.check(policyId, body);
        return { status: 200, body: decision };
      },
    },
    {
      method: "POST",
      segment: "/authorize/:policyId",
      name: "pbac.authorize",
      handler: async (ctx) => {
        const policyId = requireParam(ctx.params.policyId, "policyId required");
        if (typeof policyId !== "string") return policyId;
        const body = ctx.json<PbacInput>();
        await pbac.authorize(policyId, body);
        return { status: 204, body: null };
      },
    },
  ]);

  api.registerAction("pbac.check", async ({ input }) => {
    const { policyId, document } = input as {
      policyId: string;
      document: PbacInput;
    };
    return pbac.check(policyId, document);
  });

  return pbac;
}
