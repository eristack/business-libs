import type { Backseat } from "@eristack/backseat";
import { createPbac } from "../core/create-pbac.js";
import type { Pbac, PbacInput } from "../core/types.js";

export type RegisterPbacBackseatOptions = {
  basePath?: string;
  pbac?: Pbac;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

/** Register PBAC check/authorize routes on Backseat. Policies remain code-registered. */
export function registerPbacBackseat(
  api: Backseat,
  options: RegisterPbacBackseatOptions = {},
): Pbac {
  const pbac = options.pbac ?? createPbac();
  const base = normalizeBasePath(options.basePath ?? "/pbac");

  api.registerRoute({
    method: "POST",
    path: `${base}/check/:policyId`,
    name: "pbac.check",
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
      const body = ctx.json<PbacInput>();
      const decision = await pbac.check(policyId, body);
      return { status: 200, body: decision };
    },
  });

  api.registerRoute({
    method: "POST",
    path: `${base}/authorize/:policyId`,
    name: "pbac.authorize",
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
      const body = ctx.json<PbacInput>();
      await pbac.authorize(policyId, body);
      return { status: 204, body: null };
    },
  });

  api.registerAction("pbac.check", async ({ input }) => {
    const { policyId, document } = input as {
      policyId: string;
      document: PbacInput;
    };
    return pbac.check(policyId, document);
  });

  return pbac;
}
