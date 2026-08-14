import type { Backseat } from "@eristack/backseat";
import { createRbac } from "../core/create-rbac.js";
import type { PermissionName, Rbac, RbacConfig } from "../core/types.js";
import { createBackseatRbacStore } from "./rbac-store.js";

export type RegisterRbacBackseatOptions = Omit<RbacConfig, "store"> & {
  basePath?: string;
  /** Existing Rbac instance — when omitted, one is created from Backseat store. */
  rbac?: Rbac;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

export function registerRbacBackseat(
  api: Backseat,
  options: RegisterRbacBackseatOptions = {},
): Rbac {
  const rbacStore = createBackseatRbacStore(api.store);
  const rbac =
    options.rbac ??
    createRbac({
      store: rbacStore,
      unknownPermissionDenied: options.unknownPermissionDenied,
    });
  const base = normalizeBasePath(options.basePath ?? "/rbac");

  api.registerRoute({
    method: "GET",
    path: `${base}/can`,
    name: "rbac.can",
    handler: async (ctx) => {
      const subject = ctx.query("subject");
      const permission = ctx.query("permission") as PermissionName | undefined;
      if (!subject || !permission) {
        return {
          status: 400,
          body: {
            error: {
              code: "VALIDATION_ERROR",
              message: "subject and permission query params required",
            },
          },
        };
      }
      const allowed = await rbac.can(subject, permission);
      return { status: 200, body: { allowed } };
    },
  });

  api.registerRoute({
    method: "POST",
    path: `${base}/assign-role`,
    name: "rbac.assign-role",
    handler: async (ctx) => {
      const body = ctx.json<{ subject?: string; role?: string }>();
      if (!body.subject || !body.role) {
        return {
          status: 400,
          body: {
            error: {
              code: "VALIDATION_ERROR",
              message: "subject and role required",
            },
          },
        };
      }
      await rbac.assignRole({ subject: body.subject, role: body.role });
      return { status: 204, body: null };
    },
  });

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
