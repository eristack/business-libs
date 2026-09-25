"use client";

import { useEffect, useState } from "react";
import { DOCUMENT_ROUTE_SPECS } from "@eristack/opinion";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const BASE = "/invoices";

/**
 * Opinion hero: canonical document REST map (Horizon A).
 */
export function OpinionHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const spec = DOCUMENT_ROUTE_SPECS[index]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % DOCUMENT_ROUTE_SPECS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  const path =
    spec.suffix === "/"
      ? BASE
      : `${BASE}${spec.suffix.replace(":id", "inv-1042").replace(":action", "submit")}`;

  return (
    <DemoShell
      live="Live · DOCUMENT_ROUTE_SPECS"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground">
          {spec.role}
        </span>
      }
      className={className}
    >
      <p
        className={cn(
          "font-mono text-[13px] font-semibold transition-colors",
          spec.role === "transition"
            ? "text-[color:var(--layer-accent)]"
            : "text-foreground",
        )}
      >
        <span className="text-muted-foreground">{spec.method}</span> {path}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">{spec.summary}</p>

      <ul className="mt-3 space-y-1">
        {DOCUMENT_ROUTE_SPECS.map((row, i) => (
          <li
            key={row.role}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[10px] transition-colors",
              i === index
                ? "bg-[color:var(--layer-accent)]/15 text-foreground"
                : "text-muted-foreground",
            )}
          >
            {row.method} {row.suffix}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Partial handlers OK — createDocumentRoutes skips roles you have not
        wired yet.
      </p>
    </DemoShell>
  );
}
