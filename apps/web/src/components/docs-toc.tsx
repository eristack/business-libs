"use client";

import { ListOrdered } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/doc-toc";

function useTocScrollSpy(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length < 2) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node != null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  return activeId;
}

function TocNavList({
  items,
  activeId,
  onNavigate,
  className,
}: {
  items: TocItem[];
  activeId: string | null;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-col gap-1 border-l border-border/80 pl-3", className)}>
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={onNavigate}
            className={cn(
              "border-l-2 py-0.5 pl-2.5 text-[12.5px] leading-5 transition-colors -ml-px",
              active
                ? "border-accent font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}

export function DocsToc({ items }: { items: TocItem[] }) {
  const activeId = useTocScrollSpy(items);

  if (items.length < 2) return null;

  return (
    <aside className="no-print hidden w-52 shrink-0 xl:block 2xl:w-56">
      <div className="sticky top-[3.75rem]">
        <p className="type-eyebrow mb-3">On this page</p>
        <TocNavList items={items} activeId={activeId} />
      </div>
    </aside>
  );
}

export function DocsTocMobile({ items }: { items: TocItem[] }) {
  const activeId = useTocScrollSpy(items);
  const [open, setOpen] = useState(false);

  if (items.length < 2) return null;

  return (
    <div className="no-print mb-6 xl:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 w-full justify-start gap-2">
            <ListOrdered className="size-4 shrink-0 opacity-70" />
            <span className="truncate text-[13px]">On this page</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[min(70vh,28rem)] overflow-y-auto rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="text-left text-base">On this page</SheetTitle>
          </SheetHeader>
          <div className="mt-4 px-1">
            <TocNavList
              items={items}
              activeId={activeId}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
