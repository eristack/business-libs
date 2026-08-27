"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LibrariesNav } from "@/components/libraries-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  companyNav,
  packageCategories,
  packagesByCategory,
  primaryNav,
  siteConfig,
  startNav,
} from "@/lib/site";

type SiteHeaderProps = {
  search?: ReactNode;
};

function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isDocsRoute(pathname: string) {
  return pathname === "/docs" || pathname.startsWith("/docs/");
}

function DocsHeader({ search }: { search?: ReactNode }) {
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/70 bg-docs-rail/90 shadow-[0_1px_0_rgba(19,19,22,0.04)] backdrop-blur-lg dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex h-[3.25rem] w-full items-center justify-between gap-4 px-4 sm:px-6 xl:px-10">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <BrandMark size="sm" showWordmark />
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <nav className="flex min-w-0 items-center gap-1 text-[13px]">
            <Link
              href="/docs"
              className={cn(
                "rounded-md px-2.5 py-1.5 font-medium transition-colors",
                pathname === "/docs"
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Documentation
            </Link>
            <Link
              href="/packages"
              className="hidden rounded-md px-2.5 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Libraries
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {search}
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href={siteConfig.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteHeader({ search }: SiteHeaderProps) {
  const pathname = usePathname();

  if (isDocsRoute(pathname)) {
    return <DocsHeader search={search} />;
  }

  const mobileLinks = [
    ...primaryNav.filter(
      (l) => l.href !== "/packages" && l.href !== startNav.href,
    ),
    ...companyNav,
  ];
  const grouped = packagesByCategory();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/70 bg-background/88 shadow-[0_1px_0_rgba(19,19,22,0.04)] backdrop-blur-lg dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex h-[4.25rem] w-full items-center justify-between gap-4 px-4 sm:px-6 xl:px-10">
        <div className="flex items-center gap-8">
          <BrandMark />

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href={startNav.href}
              className={cn(
                "mr-1 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
                navActive(pathname, startNav.href)
                  ? "bg-foreground text-background"
                  : "text-foreground ring-1 ring-border hover:bg-muted/70",
              )}
            >
              {startNav.label}
            </Link>
            <LibrariesNav />
            {primaryNav
              .filter(
                (link) =>
                  link.href !== "/packages" && link.href !== startNav.href,
              )
              .map((link) => {
                const active = navActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {search}
          <ThemeToggle />
          <div className="hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/philosophy">Philosophy</Link>
            </Button>
            <Button asChild size="sm">
              <a href={siteConfig.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{siteConfig.name}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <Link
                    href={startNav.href}
                    className="block rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    {startNav.label}
                    <span className="mt-1 block text-[13px] font-normal text-muted-foreground">
                      New here? Skip the layer tour.
                    </span>
                  </Link>
                  <div>
                    <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                      Libraries
                    </p>
                    <div className="space-y-3">
                      {grouped.map((layer) => {
                        const category = packageCategories.find(
                          (c) => c.id === layer.id,
                        )!;
                        return (
                          <div key={layer.id} data-layer={layer.id}>
                            <Link
                              href={category.href}
                              className="text-sm font-semibold text-[color:var(--layer-accent)]"
                            >
                              {category.label}
                            </Link>
                            <ul className="mt-1 space-y-1 pl-2">
                              {layer.packages.map((pkg) => (
                                <li key={pkg.slug}>
                                  <Link
                                    href={pkg.href}
                                    className="text-[13px] text-muted-foreground hover:text-foreground"
                                  >
                                    {pkg.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-border pt-4">
                    {mobileLinks.map((link) => (
                      <Link
                        key={`${link.href}-${link.label}`}
                        href={link.href}
                        className="text-sm font-semibold text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <a
                      href={siteConfig.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-foreground"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
