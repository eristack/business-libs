export class RbacError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "RbacError";
    this.code = code;
  }
}

export class ForbiddenError extends RbacError {
  constructor(permission: string, subject?: string) {
    super(
      "FORBIDDEN",
      subject
        ? `Subject "${subject}" is not allowed to "${permission}"`
        : `Not allowed to "${permission}"`,
    );
    this.name = "ForbiddenError";
  }
}

export class RoleNotFoundError extends RbacError {
  constructor(role: string) {
    super("ROLE_NOT_FOUND", `Role "${role}" is not defined`);
    this.name = "RoleNotFoundError";
  }
}

export class PermissionNotFoundError extends RbacError {
  constructor(permission: string) {
    super("PERMISSION_NOT_FOUND", `Permission "${permission}" is not defined`);
    this.name = "PermissionNotFoundError";
  }
}
