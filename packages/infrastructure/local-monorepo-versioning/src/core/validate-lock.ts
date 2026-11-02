import { VersionLockValidationError } from "./errors.js";
import { compareSemver } from "./semver.js";
import type { VersionLock, WorkspaceMember } from "./types.js";

export function validateLockIssues(
  lock: VersionLock,
  workspace: WorkspaceMember[],
): string[] {
  const issues: string[] = [];

  if (lock.schema !== 1) {
    issues.push(`schema must be 1 (got ${String(lock.schema)})`);
  }

  for (const member of workspace) {
    const match = Object.entries(lock.packages).find(
      ([name, pkg]) =>
        pkg.key === member.key ||
        (member.packageName != null && name === member.packageName),
    );
    if (!match) {
      issues.push(
        `workspace member key "${member.key}" is missing from lock.packages`,
      );
      continue;
    }
    const [, pkg] = match;
    if (pkg.path !== member.path) {
      issues.push(
        `package "${match[0]}" path mismatch: lock has "${pkg.path}", workspace has "${member.path}"`,
      );
    }
  }

  for (const rel of lock.releases) {
    if (compareSemver(rel.root.to, rel.root.from) <= 0) {
      issues.push(`release ${rel.id}: root downgrade ${rel.root.from} → ${rel.root.to}`);
    }
    for (const change of rel.packages) {
      if (compareSemver(change.to, change.from) <= 0) {
        issues.push(
          `release ${rel.id}: package ${change.name} downgrade ${change.from} → ${change.to}`,
        );
      }
    }
  }

  for (const [name, pkg] of Object.entries(lock.packages)) {
    let expected: string | null = null;
    for (const rel of lock.releases) {
      const change = rel.packages.find((p) => p.name === name);
      if (change) expected = change.to;
    }
    if (expected != null && pkg.version !== expected) {
      if (compareSemver(pkg.version, expected) < 0) {
        issues.push(
          `package ${name} version ${pkg.version} is behind last release ${expected}`,
        );
      }
    }
  }

  return issues;
}

export function validateLock(lock: VersionLock, workspace: WorkspaceMember[]): void {
  const issues = validateLockIssues(lock, workspace);
  if (issues.length) {
    throw new VersionLockValidationError(
      `version lock failed validation (${issues.length} issue(s))`,
      issues,
    );
  }
}
