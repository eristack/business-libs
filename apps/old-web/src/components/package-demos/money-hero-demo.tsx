"use client";

import { useEffect, useMemo, useState } from "react";
import { Money, Tax } from "@eristack/money";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type Scene = {
  label: string;
  lines: { left: string; right: string }[];
  footer: string;
};

function buildScenes(): Scene[] {
  const subtotal = Money.of("120.00", "USD");
  const tax = Tax.onExclusive("8").apply(subtotal);
  const total = subtotal.add(tax);

  const invoice = Money.of("100.00", "USD");
  const splits = invoice.allocate(3);

  return [
    {
      label: "Arithmetic",
      lines: [
        { left: "10.50 + 1.25", right: Money.of("10.50", "USD").add(Money.of("1.25", "USD")).toString() },
        { left: "sum(3 lines)", right: Money.sum([
          Money.of("40", "USD"),
          Money.of("35", "USD"),
          Money.of("25", "USD"),
        ]).toString() },
      ],
      footer: "String decimals — never JS number literals for currency.",
    },
    {
      label: "Tax · exclusive",
      lines: [
        { left: "subtotal", right: subtotal.toString() },
        { left: "8% tax", right: tax.toString() },
        { left: "total", right: total.toString() },
      ],
      footer: "Tax operators compose on Money — same currency enforced.",
    },
    {
      label: "allocate(3)",
      lines: splits.map((part, i) => ({
        left: `share ${i + 1}`,
        right: part.toString(),
      })),
      footer: `Splits ${invoice.toString()} without losing cents.`,
    },
  ];
}

/**
 * Money hero: arithmetic, tax, and lossless allocate().
 */
export function MoneyHeroDemo({ className }: { className?: string }) {
  const scenes = useMemo(() => buildScenes(), []);
  const [index, setIndex] = useState(0);
  const scene = scenes[index]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % scenes.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [scenes.length]);

  return (
    <DemoShell
      live="Live · Money.of()"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {scene.label}
        </span>
      }
      className={className}
    >
      <ul className="space-y-1.5">
        {scene.lines.map((line) => (
          <li
            key={`${scene.label}-${line.left}`}
            className="flex items-baseline justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 font-mono text-[12px]"
          >
            <span className="text-muted-foreground">{line.left}</span>
            <span className="font-semibold text-foreground tabular-nums">
              {line.right}
            </span>
          </li>
        ))}
      </ul>
      <ol className="mt-3 flex flex-wrap gap-1">
        {scenes.map((s, i) => (
          <li
            key={s.label}
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
        {scene.footer}
      </p>
    </DemoShell>
  );
}
