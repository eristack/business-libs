"use client";

import { useEffect, useState } from "react";
import { recommend } from "@eristack/ai-knowledge";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const ASKS = [
  "invoices and login",
  "document numbers for PO",
  "line quantity unit price tax",
  "role permissions for admin",
];

/**
 * AI Knowledge hero: product language → scored recipes + packages.
 */
export function AiKnowledgeHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ASKS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  const ask = ASKS[index]!;
  const result = recommend(ask);
  const top = result.matches.slice(0, 3);
  const maxScore = Math.max(...top.map((m) => m.score || 1), 1);

  return (
    <DemoShell
      live="Live · recommend()"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground">
          {top.length} recipes
        </span>
      }
      className={className}
    >
      <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-3 py-2">
        <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
          Product ask
        </p>
        <p className="mt-0.5 text-[13px] font-medium text-foreground">
          “{ask}”
        </p>
      </div>

      <ul className="mt-3 space-y-2">
        {top.map((match, i) => {
          const pct = Math.round(((match.score || 0) / maxScore) * 100);
          return (
            <li
              key={match.recipe.id}
              className="rounded-lg border border-border/60 px-2.5 py-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12px] font-semibold text-foreground">
                  <span className="mr-1.5 font-mono text-[10px] text-muted-foreground">
                    #{i + 1}
                  </span>
                  {match.recipe.title}
                </p>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {(match.score ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[color:var(--layer-accent)] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {match.recipe.packages.map((pkg) => (
                  <span
                    key={pkg.name}
                    className={cn(
                      "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
                    )}
                  >
                    {pkg.name.replace("@eristack/", "")}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </DemoShell>
  );
}
