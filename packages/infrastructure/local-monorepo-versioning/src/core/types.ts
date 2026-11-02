export type SemverLevel = "patch" | "minor" | "major";

export type BumpRequest = { key: string; level: SemverLevel };

export type VersionLockPackage = {
  version: string;
  path: string;
  key: string;
};

export type VersionLockReleasePackage = {
  name: string;
  key: string;
  from: string;
  to: string;
  level: SemverLevel;
};

export type VersionLockRelease = {
  id: string;
  createdAt: string;
  root: { from: string; to: string; level: SemverLevel };
  packages: VersionLockReleasePackage[];
};

export type VersionLock = {
  schema: 1;
  root: string;
  packages: Record<string, VersionLockPackage>;
  releases: VersionLockRelease[];
};

export type WorkspaceMember = {
  key: string;
  path: string;
  packageName?: string;
};

export type VersionManifest = {
  release: string;
  releasedAt: string;
  latestReleaseId: string | null;
  packages: Array<{ name: string; key: string; version: string; path: string }>;
  releases: VersionLockRelease[];
};

export type ReleaseIdFactory = (
  lock: VersionLock,
  createdAt: Date,
  release: VersionLockRelease,
) => string;

export type PlanReleaseOptions = {
  createdAt?: Date;
  releaseIdFactory?: ReleaseIdFactory;
};
