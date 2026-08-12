"use client";

import { useEffect, useState } from "react";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const BUILD = [
  {
    kind: "frontmatter",
    lines: [
      "---",
      "kind: bug",
      "package: @eristack/jwt-auth",
      "title: Refresh reuse on Safari",
      "---",
    ],
  },
  {
    kind: "scenario",
    lines: [
      "## Scenario",
      "Login ok → idle 15m → refresh → 401",
      "Only Safari; Chromium fine.",
    ],
  },
  {
    kind: "repro",
    lines: [
      "## Repro",
      "1. login with credentials",
      "2. wait for access expiry",
      "3. call /sessions/refresh",
    ],
  },
  {
    kind: "logs",
    lines: [
      "## Logs",
      "RefreshTokenReuseError",
      "  at rotate() family revoke",
    ],
  },
  {
    kind: "fix",
    lines: [
      "## Fix plan",
      "Load jwt-auth-core",
      "Guard reuse path · add test",
    ],
  },
] as const;

/**
 * AI Ticket hero: portable markdown ticket assembling section-by-section.
 */
export function AiTicketHeroDemo({ className }: { className?: string }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s >= BUILD.length ? 1 : s + 1));
    }, 1700);
    return () => window.clearInterval(id);
  }, []);

  const visible = BUILD.slice(0, step);
  const progress = Math.round((step / BUILD.length) * 100);

  return (
    <DemoShell
      live="Live · portable ticket"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground">
          {progress}%
        </span>
      }
      className={className}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted-foreground">
          .eristack/tickets/bug-jwt-refresh.md
        </p>
        <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[color:var(--layer-accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-h-52 overflow-hidden rounded-xl border border-border/70 bg-muted/20">
        <pre className="space-y-2 p-3 font-mono text-[10px] leading-4">
          {visible.map((block) => (
            <code
              key={block.kind}
              className={cn(
                "block whitespace-pre-wrap text-foreground",
                block.kind === "frontmatter" && "text-muted-foreground",
              )}
            >
              {block.lines.join("\n")}
            </code>
          ))}
        </pre>
      </div>

      <ol className="mt-3 flex flex-wrap gap-1">
        {BUILD.map((block, i) => (
          <li
            key={block.kind}
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide",
              i < step
                ? "bg-[color:var(--layer-accent)] text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {block.kind}
          </li>
        ))}
      </ol>
    </DemoShell>
  );
}
