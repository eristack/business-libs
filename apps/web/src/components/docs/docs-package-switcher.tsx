"use client";

import { useRouter } from "next/navigation";
import { packageCategories, packages } from "@/lib/site";
import { cn } from "@/lib/cn";

type DocsPackageSwitcherProps = {
  packageSlug: string;
  className?: string;
};

export function DocsPackageSwitcher({
  packageSlug,
  className,
}: DocsPackageSwitcherProps) {
  const router = useRouter();

  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
        Library
      </span>
      <select
        value={packageSlug}
        onChange={(event) => {
          router.push(`/docs/${event.target.value}`);
        }}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {packageCategories.map((category) => {
          const items = packages.filter((pkg) => pkg.category === category.id);
          if (items.length === 0) return null;
          return (
            <optgroup key={category.id} label={category.label}>
              {items.map((pkg) => (
                <option key={pkg.slug} value={pkg.slug}>
                  {pkg.title} ({pkg.name.replace("@eristack/", "")})
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
