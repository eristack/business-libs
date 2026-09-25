"use client";

import { useEffect, useState } from "react";
import { Money } from "@eristack/money";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";
import { createFinancialLedger } from "@eristack/financial-ledger";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

/** Hero viz only — demo store. Apps use Drizzle. */
export function FinancialLedgerHeroDemo({
  className,
}: {
  className?: string;
}) {
  const [balance, setBalance] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function cycle() {
      const fin = createFinancialLedger({
        store: createMemoryLedgerStore(),
      });
      setStep(0);
      setLines([]);
      setBalance(null);

      await fin.post({
        accountId: "1000",
        currency: "USD",
        openingBalance: Money.of("0", "USD"),
        inAmount: Money.of("100.00", "USD"),
        entryType: "journal",
        entryTypeId: "jv-1",
      });
      if (cancelled) return;
      setStep(1);
      setLines(["1000  Dr  100.00"]);
      setBalance((await fin.snapshot("1000", "USD"))?.balance ?? null);

      await wait(2200);
      if (cancelled) return;
      await fin.post({
        accountId: "1000",
        currency: "USD",
        outAmount: "25.50",
        entryType: "journal",
        entryTypeId: "jv-2",
      });
      setStep(2);
      setLines(["1000  Dr  100.00", "1000  Cr   25.50"]);
      setBalance((await fin.snapshot("1000", "USD"))?.balance ?? null);

      await wait(2200);
      if (cancelled) return;
      const ok = await fin.verify("1000", "USD");
      setStep(ok.ok ? 3 : 0);
      await wait(2600);
      if (!cancelled) void cycle();
    }

    void cycle();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DemoShell
      live="Live · financial ledger"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          bal {balance ?? "—"}
        </span>
      }
      className={className}
    >
      <p className="font-mono text-[11px] text-muted-foreground">
        account <span className="text-foreground">1000</span> · USD
      </p>
      <ul className="mt-2 space-y-1 font-mono text-[12px]">
        {lines.map((line) => (
          <li
            key={line}
            className="rounded-md bg-muted/50 px-2 py-1 text-foreground"
          >
            {line}
          </li>
        ))}
      </ul>
      <ol className="mt-3 flex flex-wrap gap-1">
        {["post in", "post out", "verify"].map((label, i) => (
          <li
            key={label}
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase",
              i < step
                ? "bg-[color:var(--layer-accent)] text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {label}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Demo store in-browser — production uses Drizzle + Money.
      </p>
    </DemoShell>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
