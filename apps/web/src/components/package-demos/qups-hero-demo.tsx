"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateLine,
  patchLine,
  type CalculatedLine,
} from "@eristack/qups";
import { cn } from "@/lib/utils";

type Scene = {
  label: string;
  hint: string;
  lines: CalculatedLine[];
};

/**
 * Complex QUPS hero: multi-line invoice, stacked modifiers, tax, SoT switches,
 * and document rollup — driven by real calculateLine / patchLine.
 */
export function QupsHeroDemo({ className }: { className?: string }) {
  const [scene, setScene] = useState(0);
  const scenes = useMemo(() => buildScenes(), []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setScene((s) => (s + 1) % scenes.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [scenes.length]);

  const current = scenes[scene]!;
  const docTotal = current.lines.reduce(
    (sum, line) => sum + Number(line.total),
    0,
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-background/90 p-4 shadow-sm backdrop-blur-sm sm:p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Live · invoice pipeline
        </p>
        <p className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {current.label}
        </p>
      </div>

      <ol className="mb-3 flex flex-wrap gap-1">
        {scenes.map((s, i) => (
          <li
            key={s.label}
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px] transition-colors",
              i === scene
                ? "bg-[color:var(--layer-accent)] text-white"
                : i < scene
                  ? "bg-muted text-foreground"
                  : "bg-muted/40 text-muted-foreground",
            )}
          >
            {i + 1}
          </li>
        ))}
      </ol>

      <div className="overflow-hidden rounded-xl border border-border/70">
        <div className="grid grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.7fr))_minmax(0,0.85fr)] gap-px bg-border/60 font-mono text-[9px] tracking-wide text-muted-foreground uppercase">
          <div className="bg-muted/70 px-2 py-1.5">Line</div>
          <div className="bg-muted/70 px-2 py-1.5">SoT</div>
          <div className="bg-muted/70 px-2 py-1.5">Qty</div>
          <div className="bg-muted/70 px-2 py-1.5">Unit</div>
          <div className="bg-muted/70 px-2 py-1.5">Net</div>
          <div className="bg-muted/70 px-2 py-1.5">Total</div>
        </div>
        {current.lines.map((line, idx) => (
          <div
            key={`${scene}-${idx}`}
            className="grid grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.7fr))_minmax(0,0.85fr)] gap-px bg-border/40 font-mono text-[11px]"
          >
            <div className="bg-background px-2 py-1.5 text-muted-foreground">
              L{idx + 1}
            </div>
            <div className="bg-background px-2 py-1.5 text-[10px] text-muted-foreground">
              {shortTruth(line.truth)}
            </div>
            <div
              className={cn(
                "bg-background px-2 py-1.5 tabular-nums",
                line.roles.quantity === "source" &&
                  "font-semibold text-foreground",
              )}
            >
              {line.quantityRatio && line.truth === "unitPrice+subtotal"
                ? `${line.quantityRatio.numerator}/${line.quantityRatio.denominator}`
                : line.quantity}
            </div>
            <div
              className={cn(
                "bg-background px-2 py-1.5 tabular-nums",
                line.roles.unit_price === "source" &&
                  "font-semibold text-foreground",
              )}
            >
              {line.unitPrice}
            </div>
            <div className="bg-background px-2 py-1.5 tabular-nums text-muted-foreground">
              {line.net}
            </div>
            <div className="bg-background px-2 py-1.5 font-semibold tabular-nums text-foreground">
              {line.total}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 bg-muted/50 px-2 py-2 font-mono text-[11px]">
          <span className="text-muted-foreground">Doc total (USD)</span>
          <span className="font-semibold tabular-nums text-foreground">
            {docTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        {current.hint}
      </p>
    </div>
  );
}

function shortTruth(truth: CalculatedLine["truth"]) {
  if (truth === "quantity+unitPrice") return "Q+U";
  if (truth === "quantity+subtotal") return "Q+S";
  return "U+S";
}

function buildScenes(): Scene[] {
  const skuA = calculateLine({
    truth: "quantity+unitPrice",
    currency: "USD",
    quantity: "2",
    unitPrice: "50",
    round: true,
  });
  const skuB = calculateLine({
    truth: "unitPrice+subtotal",
    currency: "USD",
    unitPrice: "3",
    subtotal: "10",
    round: true,
  });
  const skuC = calculateLine({
    truth: "quantity+subtotal",
    currency: "USD",
    quantity: "4",
    subtotal: "80",
    round: true,
  });

  const discounted = [
    patchLine(skuA, {
      modifiers: [
        { kind: "discount", type: "percent", percent: "10" },
        { kind: "surcharge", type: "nominal", amount: "2" },
      ],
      round: true,
    }),
    patchLine(skuB, {
      modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
      round: true,
    }),
    skuC,
  ];

  const taxed = discounted.map((line) =>
    patchLine(line, {
      modifiers: line.modifiers,
      taxRatePercent: "11",
      round: true,
    }),
  );

  const repriced = [
    patchLine(
      calculateLine({
        truth: "quantity+unitPrice",
        currency: "USD",
        quantity: taxed[0]!.quantity,
        unitPrice: taxed[0]!.unitPrice,
        modifiers: taxed[0]!.modifiers,
        taxRatePercent: "11",
        round: true,
      }),
      { unitPrice: "55", round: true },
    ),
    taxed[1]!,
    patchLine(
      calculateLine({
        truth: "quantity+unitPrice",
        currency: "USD",
        quantity: taxed[2]!.quantity,
        unitPrice: taxed[2]!.unitPrice,
        modifiers: taxed[2]!.modifiers,
        taxRatePercent: "11",
        round: true,
      }),
      { quantity: "5", round: true },
    ),
  ];

  return [
    {
      label: "1 · three SoT modes",
      hint: "Same invoice mixes Q+U, U+S (exact 10/3 qty), and Q+S — never invent a float.",
      lines: [skuA, skuB, skuC],
    },
    {
      label: "2 · stacked modifiers",
      hint: "Percent discount then nominal surcharge on L1; L2 takes 5% off; L3 untouched.",
      lines: discounted,
    },
    {
      label: "3 · line tax @ 11%",
      hint: "Tax applies after the modifier stack — net and payable diverge per line.",
      lines: taxed,
    },
    {
      label: "4 · patch qty / unit",
      hint: "Business edits re-anchor SoT (Q+U) then patchLine — form + BE share one pipeline.",
      lines: repriced,
    },
  ];
}
