"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatAddressLines,
  formatAddressOneLine,
  isSameCountry,
  normalizeAddress,
} from "@eristack/address";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    label: "Partner ship-to",
    raw: {
      line1: "  Jl. Sudirman No. 45 ",
      line2: "Suite 12",
      locality: "Jakarta",
      region: "JK",
      postalCode: "10220",
      countryCode: "id",
    },
    compare: {
      line1: "Other",
      locality: "Bandung",
      countryCode: "ID",
    },
    hint: "Trim + uppercase ISO country — same shape for Drizzle and API JSON.",
  },
  {
    label: "Invoice bill-to",
    raw: {
      line1: "100 Market St",
      locality: "San Francisco",
      region: "CA",
      postalCode: "94105",
      countryCode: "US",
    },
    compare: {
      line1: "200 Pine St",
      locality: "Seattle",
      countryCode: "US",
    },
    hint: "formatAddressLines for print; one-line for shipping labels.",
  },
] as const;

/**
 * Address hero: normalize, format, same-country check.
 */
export function AddressHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"one" | "multi">("one");
  const scene = SCENES[index]!;

  const normalized = useMemo(
    () => normalizeAddress(scene.raw),
    [scene.raw],
  );

  const formatted =
    mode === "one"
      ? formatAddressOneLine(normalized)
      : formatAddressLines(normalized).join(" · ");

  const sameCountry = isSameCountry(normalized, scene.compare);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
      setMode((m) => (m === "one" ? "multi" : "one"));
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <DemoShell
      live="Live · normalizeAddress"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground">
          {normalized.countryCode}
        </span>
      }
      className={className}
    >
      <p className="text-[13px] font-medium">{scene.label}</p>
      <p className="mt-2 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-2 font-mono text-[11px] leading-5 text-foreground">
        {formatted}
      </p>

      <p className="mt-2 font-mono text-[10px] text-muted-foreground">
        isSameCountry →{" "}
        <span
          className={cn(
            sameCountry
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-rose-600 dark:text-rose-300",
          )}
        >
          {String(sameCountry)}
        </span>
      </p>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        {scene.hint}
      </p>
    </DemoShell>
  );
}
