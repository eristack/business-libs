"use client";

import { useEffect, useState } from "react";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type Col = "backlog" | "sprint" | "memory";

const CARDS: { id: string; title: string; col: Col; hint: string }[] = [
  {
    id: "B-14",
    title: "Wire refresh rotation",
    col: "backlog",
    hint: "jwt-auth",
  },
  {
    id: "B-15",
    title: "Monthly doc-number reset",
    col: "backlog",
    hint: "doc-number",
  },
  {
    id: "S-03",
    title: "Invoice tax edge cases",
    col: "sprint",
    hint: "qups · money",
  },
  {
    id: "ADR-003",
    title: "Credentials ≠ users",
    col: "memory",
    hint: "indexed",
  },
];

const FRAMES: Col[][] = [
  ["backlog", "backlog", "sprint", "memory"],
  ["sprint", "backlog", "sprint", "memory"],
  ["sprint", "sprint", "memory", "memory"],
];

const COLS: { id: Col; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "sprint", label: "Sprint" },
  { id: "memory", label: "ADR / FTS" },
];

/**
 * AI Workflow hero: local board + search memory (browser mock of MCP flow).
 */
export function AiWorkflowHeroDemo({ className }: { className?: string }) {
  const [frame, setFrame] = useState(0);
  const [queryPulse, setQueryPulse] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
      setQueryPulse((p) => !p);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const placement = FRAMES[frame]!;

  return (
    <DemoShell
      live="Live · .eristack/workflow"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground">
          local MCP
        </span>
      }
      className={className}
    >
      <div
        className={cn(
          "mb-3 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
          queryPulse
            ? "border-[color:var(--layer-accent)]/50 bg-[color:var(--layer-accent)]/10"
            : "border-border/70 bg-muted/40",
        )}
      >
        search “invoice tax” · FTS + vector
      </div>

      <div className="grid grid-cols-3 gap-2">
        {COLS.map((col) => (
          <div key={col.id} className="min-w-0">
            <p className="mb-1.5 font-mono text-[9px] tracking-wide text-muted-foreground uppercase">
              {col.label}
            </p>
            <ul className="min-h-[7.5rem] space-y-1.5 rounded-lg bg-muted/30 p-1.5">
              {CARDS.map((card, i) => {
                if (placement[i] !== col.id) return null;
                return (
                  <li
                    key={card.id}
                    className="rounded-md border border-border/60 bg-background px-1.5 py-1 shadow-sm"
                  >
                    <p className="font-mono text-[9px] text-[color:var(--layer-accent)]">
                      {card.id}
                    </p>
                    <p className="text-[10px] leading-snug text-foreground">
                      {card.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[8px] text-muted-foreground">
                      {card.hint}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Backlog → sprint cadence with ADR/summary indexed for low-token search —
        does not replace Intent or git.
      </p>
    </DemoShell>
  );
}
