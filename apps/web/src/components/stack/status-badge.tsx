import { cn } from "@/lib/utils";
import {
  packageStatuses,
  type PackageStatus,
} from "@/lib/site";

export type { PackageStatus };

const statusStyles: Record<
  PackageStatus,
  { label: string; className: string }
> = {
  alpha: {
    label: "Alpha",
    className:
      "bg-amber-500/15 text-amber-800 ring-amber-500/25 dark:text-amber-300",
  },
  beta: {
    label: "Beta",
    className:
      "bg-sky-500/15 text-sky-800 ring-sky-500/25 dark:text-sky-300",
  },
  stable: {
    label: "Stable",
    className:
      "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-300",
  },
};

type StatusBadgeProps = {
  status: PackageStatus;
  size?: "sm" | "md";
  className?: string;
};

export function StatusBadge({
  status,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold tracking-wide uppercase ring-1 ring-inset",
        style.className,
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "md" && "px-2 py-0.5 text-[11px]",
        className,
      )}
    >
      {style.label}
    </span>
  );
}

export function isPackageStatus(value: string): value is PackageStatus {
  return (packageStatuses as readonly string[]).includes(value);
}
