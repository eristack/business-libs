"use client";

import { useEffect, useState } from "react";
import {
  createHashChainedLedger,
  createMemoryLedgerStore,
  verifyEntries,
  type LedgerEntry,
} from "@eristack/hash-chained-ledger";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

/** Hero viz only — in-browser store. Apps use Drizzle. */
export function HashChainedLedgerHeroDemo({
  className,
}: {
  className?: string;
}) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [phase, setPhase] = useState(0);
  const [verifyOk, setVerifyOk] = useState<boolean | null>(null);
  const [tampered, setTampered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const chainId = "hero-demo";

    async function runCycle() {
      const store = createMemoryLedgerStore();
      const ledger = createHashChainedLedger({ store });
      setEntries([]);
      setPhase(0);
      setVerifyOk(null);
      setTampered(false);

      const a = await ledger.append({
        chainId,
        openingBalance: "100",
        inAmount: "20",
        entryType: "receipt",
        entryTypeId: "r1",
      });
      if (cancelled) return;
      setEntries([a]);
      setPhase(1);
      setVerifyOk(true);

      await wait(2000);
      if (cancelled) return;
      const b = await ledger.append({
        chainId,
        outAmount: "35",
        entryType: "issue",
        entryTypeId: "i1",
      });
      if (cancelled) return;
      setEntries([a, b]);
      setPhase(2);

      await wait(2000);
      if (cancelled) return;
      const c = await ledger.append({
        chainId,
        adjustment: "-1",
        entryType: "adj",
        entryTypeId: "a1",
      });
      if (cancelled) return;
      setEntries([a, b, c]);
      setPhase(3);

      await wait(2000);
      if (cancelled) return;
      const broken = [a, b, c].map((e, i) =>
        i === 0 ? { ...e, closingBalance: "999" } : e,
      );
      setEntries(broken);
      setTampered(true);
      setPhase(4);
      const bad = await verifyEntries(chainId, broken);
      setVerifyOk(bad.ok);

      await wait(2600);
      if (!cancelled) void runCycle();
    }

    void runCycle();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DemoShell
      live="Live · hash chain"
      badge={
        <span
          className={cn(
            "rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase",
            verifyOk == null
              ? "bg-muted text-muted-foreground"
              : verifyOk
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
          )}
        >
          {verifyOk == null ? "…" : verifyOk ? "intact" : "TAMPER"}
        </span>
      }
      className={className}
    >
      <ol className="mb-3 flex flex-wrap gap-1">
        {["open+in", "out", "adj", "tamper?"].map((label, i) => (
          <li
            key={label}
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase",
              i < phase
                ? "bg-[color:var(--layer-accent)] text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      <ul className="space-y-1.5 font-mono text-[11px]">
        {entries.map((e, i) => (
          <li
            key={`${e.id}-${i}-${e.closingBalance}`}
            className={cn(
              "rounded-lg border border-border/70 px-2 py-1.5",
              tampered && i === 0 && "border-rose-500/50 bg-rose-500/5",
            )}
          >
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">#{e.sequence}</span>
              <span className="truncate text-[10px] text-muted-foreground">
                {e.entryHash.slice(0, 10)}…
              </span>
            </div>
            <div className="mt-0.5 tabular-nums text-foreground">
              {e.openingBalance} +{e.inAmount} −{e.outAmount}{" "}
              {Number(e.adjustment) !== 0 ? e.adjustment : ""} →{" "}
              <strong>{e.closingBalance}</strong>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Browser demo store only — apps default to Drizzle + Postgres.
      </p>
    </DemoShell>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
