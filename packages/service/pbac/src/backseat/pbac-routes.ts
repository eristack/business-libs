import {
  businessPolicyDenied,
  requireParam,
} from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import { BusinessPolicyDeniedError } from "../core/errors.js";
import type { Pbac, PbacInput } from "../core/types.js";

export function createPbacRoutes(pbac: Pbac) {
  return [
    {
      method: "POST" as const,
      segment: "/check/:policyId",
      name: "pbac.check",
      handler: async (ctx: BackseatHandlerContext) => {
        const policyId = requireParam(ctx.params.policyId, "policyId required");
        if (typeof policyId !== "string") return policyId;
        return { status: 200, body: await pbac.check(policyId, ctx.json<PbacInput>()) };
      },
    },
    {
      method: "POST" as const,
      segment: "/authorize/:policyId",
      name: "pbac.authorize",
      handler: async (ctx: BackseatHandlerContext) => {
        const policyId = requireParam(ctx.params.policyId, "policyId required");
        if (typeof policyId !== "string") return policyId;
        try {
          await pbac.authorize(policyId, ctx.json<PbacInput>());
          return { status: 204, body: null };
        } catch (error) {
          if (error instanceof BusinessPolicyDeniedError) {
            return businessPolicyDenied(error.policyId, error.reason);
          }
          throw error;
        }
      },
    },
  ] satisfies Array<{
    method: "POST";
    segment: string;
    name: string;
    handler: (ctx: BackseatHandlerContext) => Promise<BackseatResponse>;
  }>;
}
