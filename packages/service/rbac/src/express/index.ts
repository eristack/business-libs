import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../core/errors.js";
import type { PermissionName, Rbac } from "../core/types.js";

export type RbacRequest = Request & {
  /** Set by your auth middleware — typically jwt-auth subject. */
  subject?: string;
  auth?: { subject?: string };
};

function resolveSubject(req: RbacRequest): string | undefined {
  return req.subject ?? req.auth?.subject;
}

/** Express middleware: deny unless `can(subject, permission)`. */
export function createRequirePermission(options: {
  rbac: Rbac;
  permission: PermissionName;
  getSubject?: (req: RbacRequest) => string | undefined;
}) {
  const getSubject = options.getSubject ?? resolveSubject;
  return async (req: RbacRequest, res: Response, next: NextFunction) => {
    const subject = getSubject(req);
    if (!subject) {
      res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "Missing subject" },
      });
      return;
    }
    try {
      await options.rbac.authorize(subject, options.permission);
      next();
    } catch (err) {
      if (err instanceof ForbiddenError) {
        res.status(403).json({
          error: { code: err.code, message: err.message },
        });
        return;
      }
      next(err);
    }
  };
}

export function createRequireAnyPermission(options: {
  rbac: Rbac;
  permissions: PermissionName[];
  getSubject?: (req: RbacRequest) => string | undefined;
}) {
  const getSubject = options.getSubject ?? resolveSubject;
  return async (req: RbacRequest, res: Response, next: NextFunction) => {
    const subject = getSubject(req);
    if (!subject) {
      res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "Missing subject" },
      });
      return;
    }
    const ok = await options.rbac.canAny(subject, options.permissions);
    if (!ok) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Requires any of: ${options.permissions.join(", ")}`,
        },
      });
      return;
    }
    next();
  };
}
