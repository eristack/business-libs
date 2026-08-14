import Link from "next/link";
import { StatusBadge, isComingSoon } from "@/components/stack/status-badge";
import { VersionBadge } from "@/components/stack/version-badge";
import type { PackageRelease } from "@/lib/package-meta";
import type { PackageStatus } from "@/lib/site";
import { cn } from "@/lib/utils";

type ReleaseMetaProps = {
  status: PackageStatus;
  release: PackageRelease;
  size?: "sm" | "md";
  className?: string;
  showChangelogLink?: boolean;
};

/** Status + version (+ optional changelog link) — shared release visibility. */
export function ReleaseMeta({
  status,
  release,
  size = "sm",
  className,
  showChangelogLink = true,
}: ReleaseMetaProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <StatusBadge status={status} size={size} />
      {!isComingSoon(status) ? (
        <>
          <VersionBadge
            version={release.version}
            href={release.changelogHref}
            size={size}
          />
          {showChangelogLink ? (
            <Link
              href={release.changelogHref}
              className={cn(
                "font-medium text-muted-foreground transition-colors hover:text-accent",
                size === "sm" ? "text-[11px]" : "text-[12px]",
              )}
            >
              Changelog
            </Link>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
