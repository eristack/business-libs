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
    <nav aria-label="Pages in this library" className="flex flex-col gap-4">
      {sections.map((section, index) => (
        <div key={section.label || `section-${index}`}>
          {section.label ? (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
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
                      "block rounded-lg px-2.5 py-2 text-sm leading-snug transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-muted hover:bg-surface-raised hover:text-foreground",
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
