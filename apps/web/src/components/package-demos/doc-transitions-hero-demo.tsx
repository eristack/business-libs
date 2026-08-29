"use client";

import { useEffect, useState } from "react";
import {
  actionsForStatus,
  PRESET_GRAPHS,
  publicationGraph,
} from "@eristack/doc-transitions";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const STATUS_FLOW = ["draft", "submitted", "published"] as const;

/**
 * Doc transitions hero: preset graphs → allowed actions per status.
 */
export function DocTransitionsHeroDemo({ className }: { className?: string }) {
  const [graphIndex, setGraphIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const graph = PRESET_GRAPHS[graphIndex] ?? publicationGraph;
  const statuses = Object.keys(graph.table);
  const status = statuses[statusIndex % statuses.length] ?? "draft";
  const actions = actionsForStatus(graph, status);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatusIndex((s) => {
        const next = s + 1;
        if (next >= statuses.length) {
          setGraphIndex((g) => (g + 1) % PRESET_GRAPHS.length);
          return 0;
        }
        return next;
      });
    }, 2600);
    return () => window.clearInterval(id);
  }, [statuses.length]);

  return (
    <DemoShell
      live="Live · actionsForStatus(graph, status)"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {graph.id}
        </span>
      }
      className={className}
    >
      <p className="font-mono text-[11px] text-muted-foreground">
        status{" "}
        <span className="font-semibold text-foreground">{status}</span>
      </p>

      {graph.id === "publication" ? (
        <ol className="mt-3 flex items-center gap-1">
          {STATUS_FLOW.map((step) => {
            const active = status === step;
            return (
              <li key={step} className="flex flex-1 items-center gap-1">
                <div
                  className={cn(
                    "w-full rounded-md px-1 py-1.5 text-center font-mono text-[9px] uppercase tracking-wide transition-colors",
                    active
                      ? "bg-[color:var(--layer-accent)] text-white"
                      : "bg-muted/60 text-muted-foreground",
                  )}
                >
                  {step}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {actions.length > 0 ? (
          actions.map((action) => (
            <span
              key={action}
              className="rounded-md border border-[color:var(--layer-accent)]/40 bg-[color:var(--layer-soft)] px-2 py-1 font-mono text-[10px] text-foreground"
            >
              PATCH /:id/{action}
            </span>
          ))
        ) : (
          <span className="font-mono text-[11px] text-muted-foreground">
            terminal — no outgoing actions
          </span>
        )}
      </div>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Preset vocabulary for @eristack/pbac documents.transitions() — pairs
        with @eristack/opinion HTTP.
      </p>
    </DemoShell>
  );
}
