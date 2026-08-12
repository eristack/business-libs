import Link from "next/link";
import { cn } from "@/lib/utils";

type VersionBadgeProps = {
  version: string;
  href?: string;
  size?: "sm" | "md";
  className?: string;
};

export function VersionBadge({
  version,
  href,
  size = "sm",
  className,
}: VersionBadgeProps) {
  const label = version.startsWith("v") ? version : `v${version}`;
  const classNames = cn(
    "inline-flex items-center rounded-md border border-border bg-background font-mono font-semibold text-foreground shadow-sm",
    size === "sm" && "px-1.5 py-0.5 text-[10px]",
    size === "md" && "px-2 py-0.5 text-[11px]",
    href && "transition-colors hover:border-accent/40 hover:text-accent",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classNames} title="Changelog">
        {label}
      </Link>
    );
  }

  return <span className={classNames}>{label}</span>;
}
