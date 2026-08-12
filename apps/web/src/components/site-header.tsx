"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
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
import { companyNav, primaryNav, siteConfig } from "@/lib/site";

type SiteHeaderProps = {
  search?: ReactNode;
};

export function SiteHeader({ search }: SiteHeaderProps) {
  const pathname = usePathname();
  const mobileLinks = [...primaryNav, ...companyNav];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-md dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 xl:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-[11px] font-bold tracking-tight text-background transition-transform group-hover:scale-[1.03]">
              E
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
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
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{siteConfig.name}</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-3">
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
