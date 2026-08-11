"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocMeta } from "@/lib/docs";
import { packages } from "@/lib/site";

type DocsSidebarProps = {
  packageSlug: string;
  packageName: string;
  pages: DocMeta[];
};

export function DocsSidebar({
  packageSlug,
  packageName,
  pages,
}: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 md:w-64 lg:w-72">
      <div className="sticky top-[4.5rem] space-y-8">
        <div>
          <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Switch package
          </p>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            {packages.map((pkg, index) => {
              const active = pkg.slug === packageSlug;
              return (
                <Link
                  key={pkg.slug}
                  href={pkg.href}
                  className={cn(
                    "relative block px-3.5 py-3 transition-colors",
                    index > 0 && "border-t border-zinc-100",
                    active
                      ? "bg-zinc-950 text-white"
                      : "hover:bg-zinc-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-mono text-[11px]",
                          active ? "text-zinc-400" : "text-muted-foreground",
                        )}
                      >
                        {pkg.name}
                      </p>
                      <p className="mt-0.5 text-[14px] font-semibold tracking-tight">
                        {pkg.title}
                      </p>
                      <p
                        className={cn(
                          "mt-1 line-clamp-2 text-[12px] leading-4",
                          active ? "text-zinc-400" : "text-muted-foreground",
                        )}
                      >
                        {pkg.description}
                      </p>
                    </div>
                    {active ? (
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-accent text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-zinc-200" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] text-muted-foreground">
            {packageName}
          </p>
          <nav className="flex flex-col rounded-xl border border-zinc-200 bg-white py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            {pages.map((page, index) => {
              const active = pathname === page.href;
              return (
                <Link
                  key={page.slug}
                  href={page.href}
                  className={cn(
                    "group flex items-baseline gap-3 py-1.5 pr-3 pl-3 text-[13px] transition-colors",
                    active
                      ? "bg-blue-50 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "w-5 font-mono text-[10px] tabular-nums",
                      active ? "text-accent" : "text-zinc-400",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 truncate">
                    {page.slug === "index" ? "Overview" : page.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/docs"
          className="inline-block text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All documentation
        </Link>
      </div>
    </aside>
  );
}
