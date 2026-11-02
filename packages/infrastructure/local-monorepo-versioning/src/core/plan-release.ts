import { VersionLockKeyError } from "./errors.js";
import { createReleaseId } from "./release-id.js";
import { bumpRelative, maxLevel } from "./semver.js";
import type {
  BumpRequest,
  PlanReleaseOptions,
  VersionLock,
  VersionLockRelease,
  VersionLockReleasePackage,
} from "./types.js";

function findPackageByKey(
  lock: VersionLock,
  key: string,
): { name: string; pkg: VersionLock["packages"][string] } | null {
  for (const [name, pkg] of Object.entries(lock.packages)) {
    if (pkg.key === key) return { name, pkg };
  }
  return null;
}

export function planRelease(
  lock: VersionLock,
  requests: BumpRequest[],
  options: PlanReleaseOptions = {},
): {
  release: VersionLockRelease;
  nextLock: VersionLock;
  batchLevel: ReturnType<typeof maxLevel>;
} {
  if (requests.length === 0) {
    throw new Error("planRelease requires at least one bump request");
  }

  const createdAt = options.createdAt ?? new Date();
  const batchLevel = maxLevel(...requests.map((r) => r.level));
  const rootTo = bumpRelative(lock.root, batchLevel);

  const releasePackages: VersionLockReleasePackage[] = [];
  const nextPackages = { ...lock.packages };

  for (const req of requests) {
    const found = findPackageByKey(lock, req.key);
    if (!found) throw new VersionLockKeyError(req.key);
    const from = found.pkg.version;
    const to = bumpRelative(from, req.level);
    releasePackages.push({
      name: found.name,
      key: req.key,
      from,
      to,
      level: req.level,
    });
    nextPackages[found.name] = { ...found.pkg, version: to };
  }

  const releaseWithoutId: VersionLockRelease = {
    id: "",
    createdAt: createdAt.toISOString(),
    root: { from: lock.root, to: rootTo, level: batchLevel },
    packages: releasePackages,
  };

  const id = createReleaseId(
    lock,
    releaseWithoutId,
    createdAt,
    options.releaseIdFactory,
  );
  const release: VersionLockRelease = { ...releaseWithoutId, id };

  const nextLock: VersionLock = {
    schema: 1,
    root: rootTo,
    packages: nextPackages,
    releases: [...lock.releases, release],
  };

  return { release, nextLock, batchLevel };
}
