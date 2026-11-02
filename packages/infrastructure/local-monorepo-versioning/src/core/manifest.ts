import type { VersionLock, VersionManifest } from "./types.js";

export function generateManifest(
  lock: VersionLock,
  releasedAt: string = new Date().toISOString(),
): VersionManifest {
  return {
    release: lock.root,
    releasedAt,
    latestReleaseId: lock.releases.at(-1)?.id ?? null,
    packages: Object.entries(lock.packages).map(([name, pkg]) => ({
      name,
      key: pkg.key,
      version: pkg.version,
      path: pkg.path,
    })),
    releases: [...lock.releases],
  };
}
