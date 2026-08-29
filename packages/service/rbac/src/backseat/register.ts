import { registerMountedRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createRbac } from "../core/create-rbac.js";
import type { PermissionName, Rbac, RbacConfig } from "../core/types.js";
import { createBackseatRbacStore } from "./rbac-store.js";
import { createRbacRoutes } from "./rbac-routes.js";

export type RegisterRbacBackseatOptions = Omit<RbacConfig, "store"> & {
  basePath?: string;
  rbac?: Rbac;
};

export function registerRbacBackseat(
  api: Backseat,
  options: RegisterRbacBackseatOptions = {},
): Rbac {
  const rbac =
    options.rbac ??
    createRbac({
      store: createBackseatRbacStore(api.store),
      unknownPermissionDenied: options.unknownPermissionDenied,
    });

  registerMountedRoutes(api, options.basePath ?? "/rbac", createRbacRoutes(rbac));

  api.registerAction("rbac.can", async ({ input }) => {
    const { subject, permission } = input as {
      subject: string;
      permission: PermissionName;
    };
    return { allowed: await rbac.can(subject, permission) };
  });

  return rbac;
}

export { createBackseatRbacStore } from "./rbac-store.js";
export { RBAC_COLLECTIONS } from "./collections.js";
