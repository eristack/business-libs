"use client";

import { useEffect, useState } from "react";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    label: "plan --json",
    lines: [
      '{ "profile": "pr",',
      '  "checks": ["build", "docs", "knowledge"],',
      '  "sync": ["knowledge"],',
      '  "commands": ["pnpm eristack sync knowledge"] }',
    ],
    hint: "Agents run one command to learn what CI expects from changed paths.",
  },
  {
    label: "check --profile catalog",
    lines: [
      "✓ docs — 28 catalogs",
      "✓ knowledge — 38 recipes",
      "✓ web site.ts — 28 packages",
    ],
    hint: "Fast drift gate — no compile when you only touched docs/skills.",
  },
  {
    label: "sync all --check",
    lines: [
      "docs:check · knowledge:check",
      "site.ts ↔ packages/*",
      "_meta.json ↔ *.md",
    ],
    hint: "Same hub as root pnpm docs:sync and pnpm knowledge:sync.",
  },
] as const;

/**
 * AI Dev hero: eristack CLI profiles (static terminal scenes).
 */
export function AiDevHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const scene = SCENES[index]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <DemoShell
      live="Live · eristack CLI"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {scene.label}
        </span>
      }
      className={className}
    >
      <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-3 font-mono text-[10px] leading-5 text-foreground sm:text-[11px]">
        <span className="text-muted-foreground">$ pnpm eristack </span>
        {scene.label}
        {"\n"}
        {scene.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </pre>

      <ol className="mt-3 flex gap-1">
        {SCENES.map((s, i) => (
          <li
            key={s.label}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i === index
                ? "bg-[color:var(--layer-accent)]"
                : "bg-muted",
            )}
          />
        ))}
      </ol>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        {scene.hint}
      </p>
    </DemoShell>
  );
}
