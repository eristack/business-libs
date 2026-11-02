import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  generateManifest,
  validateLock,
  type VersionLock,
  type VersionManifest,
  type WorkspaceMember,
} from "../core/index.js";

export const DEFAULT_LOCK_FILENAME = "version.lock.json";

export function loadLock(filePath: string): VersionLock {
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as VersionLock;
  if (parsed.schema !== 1) {
    throw new Error(`Unsupported lock schema: ${String(parsed.schema)}`);
  }
  return parsed;
}

export function saveLock(filePath: string, lock: VersionLock): void {
  writeFileSync(filePath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
}

export function readPackageVersion(packageJsonPath: string): string {
  const raw = readFileSync(packageJsonPath, "utf8");
  const pkg = JSON.parse(raw) as { version?: string; name?: string };
  if (!pkg.version) throw new Error(`Missing version in ${packageJsonPath}`);
  return pkg.version;
}

export function readPackageName(packageJsonPath: string): string {
  const raw = readFileSync(packageJsonPath, "utf8");
  const pkg = JSON.parse(raw) as { name?: string };
  if (!pkg.name) throw new Error(`Missing name in ${packageJsonPath}`);
  return pkg.name;
}

export function bootstrapLockFromWorkspace(
  repoRoot: string,
  workspace: WorkspaceMember[],
  rootVersion = "0.1.0",
): VersionLock {
  const packages: VersionLock["packages"] = {};
  for (const member of workspace) {
    const pkgJsonPath = path.join(repoRoot, member.path, "package.json");
    const name = member.packageName ?? readPackageName(pkgJsonPath);
    const version = readPackageVersion(pkgJsonPath);
    packages[name] = {
      key: member.key,
      path: member.path,
      version,
    };
  }
  return { schema: 1, root: rootVersion, packages, releases: [] };
}

export function applyLockToPackageJson(repoRoot: string, lock: VersionLock): void {
  for (const [name, pkg] of Object.entries(lock.packages)) {
    const pkgJsonPath = path.join(repoRoot, pkg.path, "package.json");
    const raw = readFileSync(pkgJsonPath, "utf8");
    const json = JSON.parse(raw) as { name?: string; version: string };
    if (json.name && json.name !== name) {
      throw new Error(
        `package.json name ${json.name} does not match lock entry ${name}`,
      );
    }
    json.version = pkg.version;
    writeFileSync(pkgJsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  }
}

export function writeManifest(
  filePath: string,
  lock: VersionLock,
  releasedAt?: string,
): VersionManifest {
  const manifest = generateManifest(lock, releasedAt);
  writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

export function validateLockFile(
  lockPath: string,
  workspace: WorkspaceMember[],
): void {
  validateLock(loadLock(lockPath), workspace);
}
