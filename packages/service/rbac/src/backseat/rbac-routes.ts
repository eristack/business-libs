import { validationError } from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import type { PermissionName, Rbac } from "../core/types.js";

export function createRbacRoutes(rbac: Rbac) {
  return [
    {
      method: "GET" as const,
      segment: "/can",
      name: "rbac.can",
      handler: async (ctx: BackseatHandlerContext) => {
        const subject = ctx.query("subject");
        const permission = ctx.query("permission") as PermissionName | undefined;
        if (!subject || !permission) {
          return validationError("subject and permission query params required");
        }
        return { status: 200, body: { allowed: await rbac.can(subject, permission) } };
      },
    },
    {
      method: "POST" as const,
      segment: "/assign-role",
      name: "rbac.assign-role",
      handler: async (ctx: BackseatHandlerContext) => {
        const body = ctx.json<{ subject?: string; role?: string }>();
        if (!body.subject || !body.role) {
          return validationError("subject and role required");
        }
        await rbac.assignRole({ subject: body.subject, role: body.role });
        return { status: 204, body: null };
      },
    },
  ] satisfies Array<{
    method: "GET" | "POST";
    segment: string;
    name: string;
    handler: (ctx: BackseatHandlerContext) => Promise<BackseatResponse>;
  }>;
}
