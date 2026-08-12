/** Permission names are opaque strings. Convention: `resource.action` (e.g. `orders.create`). */
export type PermissionName = string;

/** Role names are opaque strings (e.g. `purchasing.clerk`). */
export type RoleName = string;

/** App user id (same idea as jwt-auth `subject`). */
export type SubjectId = string;

export type PermissionDef = {
  name: PermissionName;
  description?: string;
};

export type RoleDef = {
  name: RoleName;
  description?: string;
  /** Permissions granted by this role (boolean membership only). */
  permissions: PermissionName[];
};

export type RbacStore = {
  listPermissions(): Promise<PermissionDef[]>;
  upsertPermission(def: PermissionDef): Promise<void>;
  listRoles(): Promise<RoleDef[]>;
  upsertRole(def: RoleDef): Promise<void>;
  deleteRole(name: RoleName): Promise<void>;
  getRole(name: RoleName): Promise<RoleDef | null>;
  listSubjectRoles(subject: SubjectId): Promise<RoleName[]>;
  assignRole(subject: SubjectId, role: RoleName): Promise<void>;
  revokeRole(subject: SubjectId, role: RoleName): Promise<void>;
  /** Optional direct grants (bypass roles). */
  listSubjectPermissions(subject: SubjectId): Promise<PermissionName[]>;
  grantPermission(subject: SubjectId, permission: PermissionName): Promise<void>;
  revokePermission(subject: SubjectId, permission: PermissionName): Promise<void>;
};

export type RbacConfig = {
  store: RbacStore;
  /**
   * When true (default), `can` returns false for unknown permissions instead of throwing.
   * `authorize` still throws if missing.
   */
  unknownPermissionDenied?: boolean;
};

export type Rbac = {
  definePermission(def: PermissionDef): Promise<void>;
  defineRole(def: RoleDef): Promise<void>;
  assignRole(input: { subject: SubjectId; role: RoleName }): Promise<void>;
  revokeRole(input: { subject: SubjectId; role: RoleName }): Promise<void>;
  grantPermission(input: {
    subject: SubjectId;
    permission: PermissionName;
  }): Promise<void>;
  revokePermission(input: {
    subject: SubjectId;
    permission: PermissionName;
  }): Promise<void>;
  /** Effective permission set for a subject (roles ∪ direct grants). */
  permissionsFor(subject: SubjectId): Promise<Set<PermissionName>>;
  rolesFor(subject: SubjectId): Promise<RoleName[]>;
  /** Boolean check — the only RBAC answer shape. */
  can(subject: SubjectId, permission: PermissionName): Promise<boolean>;
  canAny(subject: SubjectId, permissions: PermissionName[]): Promise<boolean>;
  canAll(subject: SubjectId, permissions: PermissionName[]): Promise<boolean>;
  /** Like `can`, but throws `ForbiddenError` when denied. */
  authorize(subject: SubjectId, permission: PermissionName): Promise<void>;
};
