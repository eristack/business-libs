import type { Backseat } from "@eristack/backseat";
import { createAbac } from "../core/create-abac.js";
import type { Abac, AbacContext } from "../core/types.js";

export type RegisterAbacBackseatOptions = {
  basePath?: string;
  abac?: Abac;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

/** Register ABAC evaluate/authorize routes on Backseat. Policies remain code-registered. */
export function registerAbacBackseat(
  api: Backseat,
  options: RegisterAbacBackseatOptions = {},
): Abac {
  const abac = options.abac ?? createAbac();
  const base = normalizeBasePath(options.basePath ?? "/abac");

  api.registerRoute({
    method: "POST",
    path: `${base}/evaluate/:policyId`,
    name: "abac.evaluate",
    handler: async (ctx) => {
      const policyId = ctx.params.policyId;
      if (!policyId) {
        return {
          status: 400,
          body: {
            error: { code: "VALIDATION_ERROR", message: "policyId required" },
          },
        };
      }
      const body = ctx.json<AbacContext>();
      const decision = await abac.evaluate(policyId, body);
      return { status: 200, body: decision };
    },
  });

  api.registerRoute({
    method: "POST",
    path: `${base}/authorize/:policyId`,
    name: "abac.authorize",
    handler: async (ctx) => {
      const policyId = ctx.params.policyId;
      if (!policyId) {
        return {
          status: 400,
          body: {
            error: { code: "VALIDATION_ERROR", message: "policyId required" },
          },
        };
      }
      const body = ctx.json<AbacContext>();
      await abac.authorize(policyId, body);
      return { status: 204, body: null };
    },
  });

  api.registerAction("abac.evaluate", async ({ input }) => {
    const { policyId, ctx } = input as {
      policyId: string;
      ctx: AbacContext;
    };
    return abac.evaluate(policyId, ctx);
  });

  return abac;
}
