import type { ReleaseIdFactory, VersionLock, VersionLockRelease } from "./types.js";

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

function randomSuffix(): string {
  return Math.random().toString(16).slice(2, 6);
}

/** `YYYYMMDD.NNNN-xxxx` — sequence counts releases on the same UTC calendar day. */
export const defaultReleaseIdFactory: ReleaseIdFactory = (
  lock,
  createdAt,
  _release,
) => {
  const y = createdAt.getUTCFullYear();
  const mo = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(createdAt.getUTCDate()).padStart(2, "0");
  const dayPrefix = `${y}${mo}${d}`;
  const sameDay = lock.releases.filter((r) => r.id.startsWith(dayPrefix)).length;
  return `${dayPrefix}.${pad4(sameDay + 1)}-${randomSuffix()}`;
};

export function createReleaseId(
  lock: VersionLock,
  release: VersionLockRelease,
  createdAt: Date,
  factory: ReleaseIdFactory = defaultReleaseIdFactory,
): string {
  return factory(lock, createdAt, release);
}
