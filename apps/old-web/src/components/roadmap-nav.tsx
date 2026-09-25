import Link from "next/link";
import { cn } from "@/lib/utils";
import { roadmapSections } from "@/lib/roadmap";

type RoadmapNavProps = {
  currentSlug?: string;
  className?: string;
};

export function RoadmapNav({ currentSlug, className }: RoadmapNavProps) {
  return (
    <nav className={cn("space-y-8", className)}>
      <div>
        <Link
          href="/roadmap"
          className={cn(
            "block rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            !currentSlug
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          Overview
        </Link>
      </div>

      {roadmapSections.map((section) => (
        <div key={section.id}>
          <p className="px-3 font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {section.title}
          </p>
          <ul className="mt-2 space-y-0.5">
            {section.links.map((link) => {
              const active = currentSlug === link.slug;
              return (
                <li key={link.slug}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-muted font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="border-t border-border pt-6">
        <Link
          href="/start"
          className="block rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
        >
          Start here
          <span className="mt-0.5 block text-[12px] font-normal text-muted-foreground">
            Onboarding — not in the roadmap
          </span>
        </Link>
      </div>
    </nav>
  );
}
