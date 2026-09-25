"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site";

const nav = [
  { href: "/products", label: "Products" },
  { href: "/story", label: "Story" },
  { href: "/support", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-neutral/85 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span
            className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-neutral"
            aria-hidden
          >
            E
          </span>
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={siteConfig.github}
            className="btn btn-ghost hidden text-sm sm:inline-flex"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
          <Link href="/products" className="btn btn-primary text-sm">
            Browse libraries
          </Link>
        </div>
      </div>

      <nav
        className="container-page flex gap-1 overflow-x-auto border-t border-border/60 py-2 sm:hidden"
        aria-label="Mobile"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
