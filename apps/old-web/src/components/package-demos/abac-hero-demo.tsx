"use client";

import { useEffect, useMemo, useState } from "react";
import { attrs, createAbac } from "@eristack/abac";
import {
  DecisionBadge,
  DemoShell,
} from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const MAX = 500_000;

const SCENES = [
  { label: "Clerk · GR under ceiling", book: 120_000, max: MAX },
  { label: "Clerk · GR at ceiling", book: 500_000, max: MAX },
  { label: "Clerk · GR over ceiling", book: 750_000, max: MAX },
  { label: "Manager · raised ceiling", book: 750_000, max: 1_000_000 },
] as const;

/**
 * ABAC hero: dual-rail attribute comparison + live evaluate().
 */
export function AbacHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | undefined>();

  const abac = useMemo(() => {
    const api = createAbac();
    api.registerPolicy({
      id: "goods-receipt.book-value-limit",
      evaluate: attrs.subjectLimitAtLeastResource({
        subjectPath: "subject.attrs.maxBookValueMinor",
        resourcePath: "resource.attrs.bookValueMinor",
        reason: "Book value exceeds subject max",
      }),
    });
    return api;
  }, []);

  const scene = SCENES[index]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const decision = await abac.evaluate("goods-receipt.book-value-limit", {
        subject: { id: "user_1", attrs: { maxBookValueMinor: scene.max } },
        resource: {
          id: "gr_1",
          attrs: { bookValueMinor: scene.book },
        },
      });
      if (!cancelled) {
        setAllowed(decision.allowed);
        setReason(decision.reason);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [abac, scene]);

  const scale = Math.max(scene.max, scene.book);
  const maxPct = Math.round((scene.max / scale) * 100);
  const bookPct = Math.round((scene.book / scale) * 100);

  return (
    <DemoShell
      live="Live · attribute policy"
      badge={<DecisionBadge allowed={allowed} />}
      className={className}
    >
      <p className="text-[13px] font-medium text-foreground">{scene.label}</p>

      <div className="mt-4 space-y-3">
        <Rail
          label="subject.maxBookValue"
          value={formatMinor(scene.max)}
          pct={maxPct}
          tone="ceiling"
        />
        <Rail
          label="resource.bookValue"
          value={formatMinor(scene.book)}
          pct={bookPct}
          tone={allowed ? "ok" : "hot"}
        />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-mono text-[10px]">
        <div className="rounded-lg border border-border/70 bg-muted/40 px-2 py-2 text-center">
          subject attrs
        </div>
        <div
          className={cn(
            "rounded-md px-2 py-1 font-semibold uppercase",
            allowed
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
          )}
        >
          f(a)→bool
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/40 px-2 py-2 text-center">
          resource attrs
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        {reason ??
          "RBAC says who may try; ABAC weighs numbers — same policy, attrs change."}
      </p>
    </DemoShell>
  );
}

function Rail({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "ceiling" | "ok" | "hot";
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 font-mono text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            tone === "ceiling" && "bg-[color:var(--layer-accent)]/70",
            tone === "ok" && "bg-[color:var(--layer-accent)]",
            tone === "hot" && "bg-rose-500/80",
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatMinor(minor: number): string {
  return (minor / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
