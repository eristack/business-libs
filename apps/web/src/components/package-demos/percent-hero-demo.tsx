"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fromBasisPoints,
  parsePercent,
  percentOf,
  plusPercent,
} from "@eristack/percent";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    label: "VAT · 11%",
    rate: parsePercent("11%"),
    base: "100",
    hint: "Tax codes as ratio strings — round with @eristack/money at invoice boundaries.",
  },
  {
    label: "Basis points · 1100 bps",
    rate: fromBasisPoints("1100"),
    base: "250",
    hint: "Finance tables often store bps; core stays decimal strings.",
  },
  {
    label: "Stacked · +7.5%",
    rate: parsePercent("7.5%"),
    base: "1000",
    hint: "plusPercent on strings before Money totals — never 0.075 literals.",
  },
] as const;

/**
 * Percent hero: parse rates and apply to string amounts.
 */
export function PercentHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const scene = SCENES[index]!;

  const derived = useMemo(() => {
    const portion = percentOf(scene.base, scene.rate);
    const total = plusPercent(scene.base, scene.rate);
    return { portion, total };
  }, [scene]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <DemoShell
      live="Live · percentOf / plusPercent"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground">
          ratio {scene.rate.ratio}
        </span>
      }
      className={className}
    >
      <p className="text-[13px] font-medium">{scene.label}</p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        base <span className="text-foreground">{scene.base}</span>
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="rounded-lg border border-border/70 px-2 py-1.5">
          <dt className="text-muted-foreground">portion</dt>
          <dd className="tabular-nums text-foreground">{derived.portion}</dd>
        </div>
        <div className="rounded-lg border border-border/70 px-2 py-1.5">
          <dt className="text-muted-foreground">plusPercent</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {derived.total}
          </dd>
        </div>
      </dl>

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
