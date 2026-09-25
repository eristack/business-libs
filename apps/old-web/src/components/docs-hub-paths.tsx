import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsHubPaths } from "@/lib/docs-hub-paths";

export function DocsHubPaths() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {docsHubPaths.map((path) => (
        <Link
          key={path.id}
          href={path.href}
          className="group flex flex-col rounded-xl border border-border/70 bg-card/80 p-4 shadow-[0_1px_2px_rgba(26,24,20,0.03)] transition-[border-color,box-shadow,background-color] hover:border-border hover:bg-card hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                {path.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
                {path.description}
              </p>
            </div>
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>
          {path.links && path.links.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
              {path.links.map((link) => (
                <span
                  key={link.href}
                  className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  + {link.label}
                </span>
              ))}
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
