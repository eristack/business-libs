export const RBAC_COLLECTIONS = {
  permissions: "rbac.permissions",
  roles: "rbac.roles",
  subjectRoles: "rbac.subjectRoles",
  subjectPermissions: "rbac.subjectPermissions",
} as const;

export function subjectRoleId(subject: string, role: string): string {
  return `${subject}\0${role}`;
}

export function subjectPermissionId(subject: string, permission: string): string {
  return `${subject}\0${permission}`;
}
