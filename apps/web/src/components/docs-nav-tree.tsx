"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DocNavSection } from "@/lib/docs";
import { pageNavLabel } from "@/lib/doc-nav";
import type { PackageCategoryId } from "@/lib/site";

type DocsNavTreeProps = {
  sections: DocNavSection[];
  onNavigate?: () => void;
  showSections?: boolean;
  layerId?: PackageCategoryId;
  className?: string;
};

export function DocsNavTree({
  sections,
  onNavigate,
  showSections = true,
  layerId,
  className,
}: DocsNavTreeProps) {
  const pathname = usePathname();
  const navSections = showSections
    ? sections
    : [{ label: "", pages: sections.flatMap((section) => section.pages) }];

  return (
    <nav
      data-layer={layerId}
      aria-label="Documentation pages"
      className={cn("flex flex-col", className)}
    >
      {navSections.map((section, index) => (
        <div
          key={section.pages[0]?.slug ?? `section-${index}`}
          className={cn(index > 0 && "mt-4 border-t border-border/45 pt-4")}
        >
          {section.label && showSections ? (
            <p className="mb-2 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/75 uppercase">
              {section.label}
            </p>
          ) : null}
          <ul className="flex flex-col gap-px">
            {section.pages.map((page) => {
              const active = pathname === page.href;
              return (
                <li key={page.slug}>
                  <Link
                    href={page.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-md py-[0.4375rem] pr-2.5 pl-2.5 text-[12.5px] leading-[1.45] transition-[color,background-color,border-color] duration-150",
                      active
                        ? "border-l-2 border-[color:var(--layer-accent)] bg-card/90 pl-[calc(0.625rem-1px)] font-medium text-foreground shadow-[inset_0_0_0_1px_rgba(26,24,20,0.04)] dark:bg-card/70 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                        : "border-l-2 border-transparent text-muted-foreground hover:bg-card/50 hover:text-foreground dark:hover:bg-card/30",
                    )}
                  >
                    <span className="line-clamp-2">{pageNavLabel(page)}</span>
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
