import fs from "node:fs";
import path from "node:path";
import { packages, type PackageSlug } from "@/lib/site";

const repoRoot = path.resolve(process.cwd(), "../..");

export type PackageRelease = {
  version: string;
  hasChangelog: boolean;
  changelogPath: string | null;
  changelogHref: string;
  npmHref: string;
  githubChangelogHref: string | null;
};

function readJsonVersion(directory: string): string {
  const pkgJsonPath = path.join(repoRoot, directory, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return "0.0.0";
  try {
    const raw = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")) as {
      version?: string;
    };
    return raw.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export function getPackageRelease(pkg: {
  slug: string;
  name: string;
  directory: string;
}): PackageRelease {
  const changelogFile = path.join(repoRoot, pkg.directory, "CHANGELOG.md");
  const hasChangelog = fs.existsSync(changelogFile);

  return {
    version: readJsonVersion(pkg.directory),
    hasChangelog,
    changelogPath: hasChangelog
      ? `${pkg.directory}/CHANGELOG.md`
      : null,
    changelogHref: `/${pkg.slug}/changelog`,
    npmHref: `https://www.npmjs.com/package/${pkg.name}`,
    githubChangelogHref: hasChangelog
      ? `https://github.com/eristack/business-libs/blob/main/${pkg.directory}/CHANGELOG.md`
      : null,
  };
}

export function readPackageChangelog(directory: string): string | null {
  const changelogFile = path.join(repoRoot, directory, "CHANGELOG.md");
  if (!fs.existsSync(changelogFile)) return null;
  return fs.readFileSync(changelogFile, "utf8");
}

export function getReleaseBySlug(slug: PackageSlug | string) {
  const pkg = packages.find((item) => item.slug === slug);
  if (!pkg) return null;
  return { pkg, release: getPackageRelease(pkg) };
}

/** Serializable release map for client components (e.g. docs sidebar). */
export function allPackageReleases(): Record<
  string,
  Pick<PackageRelease, "version" | "changelogHref" | "hasChangelog">
> {
  return Object.fromEntries(
    packages.map((pkg) => {
      const release = getPackageRelease(pkg);
      return [
        pkg.slug,
        {
          version: release.version,
          changelogHref: release.changelogHref,
          hasChangelog: release.hasChangelog,
        },
      ];
    }),
  );
}

/** Latest version heading from changelog, if parseable. */
export function latestChangelogVersion(markdown: string | null): string | null {
  if (!markdown) return null;
  const match = markdown.match(/^##\s+(\d+\.\d+\.\d+)\s*$/m);
  return match?.[1] ?? null;
}
