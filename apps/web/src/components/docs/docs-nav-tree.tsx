"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { DocNavSection } from "@/lib/docs";
import { pageNavLabel } from "@/lib/doc-nav";

type DocsNavTreeProps = {
  sections: DocNavSection[];
  onNavigate?: () => void;
};

export function DocsNavTree({ sections, onNavigate }: DocsNavTreeProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Pages in this library" className="flex flex-col">
      {sections.map((section, index) => (
        <div
          key={section.label || `section-${index}`}
          className={cn(index > 0 && "mt-4 border-t border-border pt-4")}
        >
          {section.label ? (
            <p className="mb-2 px-1 text-[10px] font-bold tracking-[0.14em] text-foreground/75 uppercase">
              {section.label}
            </p>
          ) : null}
          <ul className="flex flex-col gap-0.5">
            {section.pages.map((page) => {
              const active = pathname === page.href;
              return (
                <li key={page.slug}>
                  <Link
                    href={page.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-md border-l-2 py-2 pr-2.5 pl-2.5 text-[13px] leading-snug transition-[color,background-color,border-color]",
                      active
                        ? "border-primary bg-primary/12 font-semibold text-foreground shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)]"
                        : "border-transparent font-medium text-foreground/82 hover:border-primary/35 hover:bg-surface-raised hover:text-foreground",
                    )}
                  >
                    {pageNavLabel(page)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
