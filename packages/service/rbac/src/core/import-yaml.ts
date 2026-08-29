import type { PermissionName, RoleName } from "./types.js";
import type { Rbac } from "./types.js";

export type RbacYamlRole = {
  name: RoleName;
  permissions: PermissionName[];
  description?: string;
};

export type RbacYamlDocument = {
  permissions?: Array<{ name: PermissionName; description?: string }>;
  roles: RbacYamlRole[];
};

function parseSimpleYaml(text: string): RbacYamlDocument {
  const lines = text.split("\n");
  const doc: RbacYamlDocument = { roles: [] };
  let section: "none" | "permissions" | "roles" = "none";
  let currentRole: RbacYamlRole | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim() || line.trim().startsWith("#")) continue;

    if (line === "permissions:") {
      section = "permissions";
      doc.permissions = doc.permissions ?? [];
      currentRole = null;
      continue;
    }
    if (line === "roles:") {
      section = "roles";
      currentRole = null;
      continue;
    }

    if (section === "permissions") {
      const match = line.match(/^\s*-\s*name:\s*(.+)$/);
      if (match) {
        doc.permissions!.push({
          name: match[1]!.trim().replace(/^["']|["']$/g, ""),
        });
      }
      continue;
    }

    if (section === "roles") {
      const roleMatch = line.match(/^\s*-\s*name:\s*(.+)$/);
      if (roleMatch) {
        currentRole = {
          name: roleMatch[1]!.trim().replace(/^["']|["']$/g, ""),
          permissions: [],
        };
        doc.roles.push(currentRole);
        continue;
      }
      const permMatch = line.match(/^\s*-\s*(.+)$/);
      if (permMatch && currentRole && !line.includes("name:")) {
        currentRole.permissions.push(
          permMatch[1]!.trim().replace(/^["']|["']$/g, ""),
        );
      }
    }
  }

  return doc;
}

/** Bulk define permissions + roles from a minimal YAML admin export. */
export async function importRolesFromYaml(
  rbac: Rbac,
  yaml: string,
): Promise<{ permissions: number; roles: number }> {
  const doc = parseSimpleYaml(yaml);
  const permissionNames = new Set<PermissionName>();

  for (const perm of doc.permissions ?? []) {
    permissionNames.add(perm.name);
  }
  for (const role of doc.roles) {
    for (const permission of role.permissions) {
      permissionNames.add(permission);
    }
  }

  for (const name of permissionNames) {
    const meta = doc.permissions?.find((p) => p.name === name);
    await rbac.definePermission({
      name,
      description: meta?.description,
    });
  }

  for (const role of doc.roles) {
    await rbac.defineRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
  }

  return { permissions: permissionNames.size, roles: doc.roles.length };
}
