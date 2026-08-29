import { requireParam } from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import type { Abac, AbacContext } from "../core/types.js";

export function createAbacRoutes(abac: Abac) {
  const withPolicy = (
    handler: (policyId: string, body: AbacContext) => Promise<BackseatResponse>,
  ) =>
    async (ctx: BackseatHandlerContext) => {
      const policyId = requireParam(ctx.params.policyId, "policyId required");
      if (typeof policyId !== "string") return policyId;
      return handler(policyId, ctx.json<AbacContext>());
    };

  return [
    {
      method: "POST" as const,
      segment: "/evaluate/:policyId",
      name: "abac.evaluate",
      handler: withPolicy(async (policyId, body) => ({
        status: 200,
        body: await abac.evaluate(policyId, body),
      })),
    },
    {
      method: "POST" as const,
      segment: "/authorize/:policyId",
      name: "abac.authorize",
      handler: withPolicy(async (policyId, body) => {
        await abac.authorize(policyId, body);
        return { status: 204, body: null };
      }),
    },
  ] satisfies Array<{
    method: "POST";
    segment: string;
    name: string;
    handler: (ctx: BackseatHandlerContext) => Promise<BackseatResponse>;
  }>;
}
