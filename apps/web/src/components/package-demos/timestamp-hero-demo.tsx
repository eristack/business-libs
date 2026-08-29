"use client";

import { useEffect, useMemo, useState } from "react";
import {
  instantOf,
  toLocalDateString,
  wallOf,
  wallToInstantOnce,
} from "@eristack/timestamp";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    label: "Instant · UTC fact",
    hint: "When it happened — store UTC, derive local calendar date in IANA zone.",
    run: () => {
      const posted = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
      return {
        mode: "instant" as const,
        primary: posted.instant,
        secondary: toLocalDateString(posted),
        zone: posted.timezone,
      };
    },
  },
  {
    label: "Wall · local intent",
    hint: "When it will happen — 9:00 Paris stays wall local until you resolve once.",
    run: () => {
      const due = wallOf("2026-09-15T09:00:00", "Europe/Paris");
      return {
        mode: "wall" as const,
        primary: due.local,
        secondary: due.timezone,
        zone: due.timezone,
      };
    },
  },
  {
    label: "Resolve · wall → instant",
    hint: "wallToInstantOnce at API/ledger boundary — explicit DST handling.",
    run: () => {
      const due = wallOf("2026-09-15T09:00:00", "Europe/Paris");
      const resolved = wallToInstantOnce(due);
      return {
        mode: "resolve" as const,
        primary: due.local,
        secondary: resolved.instant,
        zone: due.timezone,
      };
    },
  },
] as const;

/**
 * Timestamp hero: instant vs wall modes and one-shot UTC resolution.
 */
export function TimestampHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const scene = SCENES[index]!;

  const result = useMemo(() => scene.run(), [scene]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <DemoShell
      live="Live · instantOf / wallOf"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {scene.label}
        </span>
      }
      className={className}
    >
      <dl className="space-y-2 font-mono text-[11px]">
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
          <dt className="text-[9px] tracking-wide text-muted-foreground uppercase">
            {result.mode === "instant"
              ? "UTC instant"
              : result.mode === "wall"
                ? "Wall local"
                : "Wall → UTC"}
          </dt>
          <dd className="mt-1 break-all text-foreground">{result.primary}</dd>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
          <dt className="text-[9px] tracking-wide text-muted-foreground uppercase">
            {result.mode === "instant"
              ? "Local date"
              : result.mode === "wall"
                ? "Timezone"
                : "Resolved instant"}
          </dt>
          <dd className="mt-1 break-all font-semibold text-foreground">
            {result.secondary}
          </dd>
        </div>
      </dl>

      <p className="mt-2 font-mono text-[10px] text-muted-foreground">
        zone · {result.zone}
      </p>

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
