"use client";

import { useEffect, useState } from "react";
import {
  createDocNumber,
  createMemoryFormatStore,
  createMemorySequenceStore,
} from "@eristack/doc-number";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type Scene = {
  entityKey: string;
  pattern: string;
  label: string;
};

const SCENES: Scene[] = [
  {
    entityKey: "purchase_order",
    pattern: "PO-{YYYY}-{SEQ:5}",
    label: "PO · yearly",
  },
  {
    entityKey: "invoice",
    pattern: "INV-{YYYY}{MM}-{SEQ:4}",
    label: "INV · monthly",
  },
  {
    entityKey: "receipt",
    pattern: "RCPT/{YY}{MM}/{SEQ:3}",
    label: "RCPT · compact",
  },
];

/**
 * Doc-number hero: register formats and allocate next document numbers.
 */
export function DocNumberHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [allocating, setAllocating] = useState(false);

  const scene = SCENES[index]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setAllocating(true);
      setNumbers([]);
      const clock = () => new Date("2026-08-14T10:00:00.000Z");
      const doc = createDocNumber({
        formats: createMemoryFormatStore(),
        sequences: createMemorySequenceStore(),
        clock,
        idFactory: () => `fmt_${Math.random().toString(36).slice(2, 8)}`,
      });
      await doc.registerFormat({
        entityKey: scene.entityKey,
        pattern: scene.pattern,
        reset: scene.pattern.includes("{MM}") ? "monthly" : "yearly",
      });
      const batch: string[] = [];
      for (let i = 0; i < 3; i++) {
        const next = await doc.next({ entityKey: scene.entityKey });
        batch.push(next.value);
      }
      if (!cancelled) {
        setNumbers(batch);
        setAllocating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scene]);

  return (
    <DemoShell
      live="Live · doc.next()"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground">
          {scene.label}
        </span>
      }
      className={className}
    >
      <p className="font-mono text-[11px] text-muted-foreground">
        pattern{" "}
        <span className="text-foreground">{scene.pattern}</span>
      </p>

      <ul className="mt-3 space-y-1.5">
        {(allocating ? ["…", "…", "…"] : numbers).map((value, i) => (
          <li
            key={`${scene.entityKey}-${i}`}
            className={cn(
              "flex items-center justify-between rounded-lg border border-border/60 px-2.5 py-1.5 font-mono text-[12px]",
              allocating ? "bg-muted/20 text-muted-foreground" : "bg-muted/40",
            )}
          >
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              #{i + 1}
            </span>
            <span className="font-semibold text-foreground">{value}</span>
          </li>
        ))}
      </ul>

      <ol className="mt-3 flex flex-wrap gap-1">
        {SCENES.map((s, i) => (
          <li
            key={s.entityKey}
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase transition-colors",
              i === index
                ? "bg-[color:var(--layer-soft)] text-[color:var(--layer-accent)]"
                : "bg-muted text-muted-foreground",
            )}
          >
            {s.label}
          </li>
        ))}
      </ol>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Token patterns with reset periods — Drizzle stores in production apps.
      </p>
    </DemoShell>
  );
}
