import type { Backseat } from "../core/types.js";
import type { createJwtAuth } from "@eristack/jwt-auth";
import type { createPbac } from "@eristack/pbac";
import type { registerEpochBackseat } from "@eristack/epoch/backseat";

export type HorizonDocumentSpineJwt = {
  jwtAuth: ReturnType<typeof createJwtAuth>;
  basePath?: string;
  refreshTokenTransport?: "body" | "cookie";
};

export type RegisterHorizonDocumentSpineOptions = {
  /** App-owned PBAC instance (register transition graphs before calling). */
  pbac: ReturnType<typeof createPbac>;
  basePath?: {
    pbac?: string;
    epoch?: string;
    qups?: string;
  };
  jwt?: HorizonDocumentSpineJwt;
  /** App-specific data-grid routes and other mounts after core spine. */
  afterCore?: (api: Backseat) => void | Promise<void>;
};

export type HorizonDocumentSpineResult = {
  epoch: ReturnType<typeof registerEpochBackseat>;
};

/**
 * Register the standard Horizon A document spine: pbac, epoch, qups, optional jwt.
 * App supplies PBAC (with doc-transitions graphs) and optional list routes in afterCore.
 */
export async function registerHorizonDocumentSpine(
  api: Backseat,
  options: RegisterHorizonDocumentSpineOptions,
): Promise<HorizonDocumentSpineResult> {
  const { registerPbacBackseat } = await import("@eristack/pbac/backseat");
  const { registerEpochBackseat } = await import("@eristack/epoch/backseat");
  const { registerQupsBackseat } = await import("@eristack/qups/backseat");

  const paths = {
    pbac: options.basePath?.pbac ?? "/pbac",
    epoch: options.basePath?.epoch ?? "/epoch",
    qups: options.basePath?.qups ?? "/qups",
  };

  registerPbacBackseat(api, { basePath: paths.pbac, pbac: options.pbac });
  const epoch = registerEpochBackseat(api, { basePath: paths.epoch });
  registerQupsBackseat(api, { basePath: paths.qups });

  if (options.jwt) {
    const { registerJwtAuthBackseat } = await import("@eristack/jwt-auth/backseat");
    registerJwtAuthBackseat(api, {
      basePath: options.jwt.basePath ?? "/auth",
      jwtAuth: options.jwt.jwtAuth,
      refreshTokenTransport: options.jwt.refreshTokenTransport ?? "body",
    });
  }

  if (options.afterCore) {
    await options.afterCore(api);
  }

  return { epoch };
}
