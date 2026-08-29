"use client";

import { useEffect, useMemo, useState } from "react";
import { convertUom, registerUomDefinitions, uomQty } from "@eristack/uom";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

registerUomDefinitions([
  { code: "box", dimension: "count", toBaseFactor: "12", label: "Box of 12 ea" },
]);

const SCENES = [
  {
    label: "Mass · kg → g",
    from: uomQty("1.5", "kg"),
    toUnit: "g",
    hint: "Fixed ratio within dimension — no float drift.",
  },
  {
    label: "Count · box → pcs",
    from: uomQty("3", "box"),
    toUnit: "pcs",
    hint: "App-registered box = 12 ea converts like SI units.",
  },
  {
    label: "Volume · L → mL",
    from: uomQty("2.5", "L"),
    toUnit: "mL",
    hint: "String decimals end-to-end — same discipline as money.",
  },
] as const;

/**
 * UOM hero: live convertUom across dimensions.
 */
export function UomHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const scene = SCENES[index]!;

  const result = useMemo(
    () => convertUom(scene.from, scene.toUnit),
    [scene.from, scene.toUnit],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <DemoShell
      live="Live · convertUom(qty, targetUnit)"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {scene.label}
        </span>
      }
      className={className}
    >
      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
          <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
            From
          </p>
          <p className="mt-1 tabular-nums text-foreground">
            {scene.from.amount}{" "}
            <span className="text-[color:var(--layer-accent)]">
              {scene.from.unit}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
          <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
            To
          </p>
          <p className="mt-1 tabular-nums font-semibold text-foreground">
            {result.amount}{" "}
            <span className="text-[color:var(--layer-accent)]">
              {result.unit}
            </span>
          </p>
        </div>
      </div>

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
