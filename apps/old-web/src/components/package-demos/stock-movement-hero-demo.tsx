"use client";

import { useEffect, useState } from "react";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";
import {
  createStockMovement,
  locationIdFromParts,
} from "@eristack/stock-movement";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

/** Hero viz only — demo store. Apps use Drizzle. */
export function StockMovementHeroDemo({ className }: { className?: string }) {
  const [locationId, setLocationId] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [parts] = useState([
    { key: "warehouseId", value: "WH-A" },
    { key: "machineId", value: "CNC-1" },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function cycle() {
      const loc = await locationIdFromParts(parts);
      if (cancelled) return;
      setLocationId(loc);
      const stock = createStockMovement({
        store: createMemoryLedgerStore(),
      });
      setStep(1);
      setBalance(null);

      await stock.append({
        locationId: loc,
        lotId: "LOT-1",
        ownerId: "SKU-9",
        openingBalance: "0",
        inAmount: "100",
        entryType: "receipt",
        entryTypeId: "gr-1",
      });
      if (cancelled) return;
      setStep(2);
      setBalance((await stock.snapshot({ locationId: loc, lotId: "LOT-1", ownerId: "SKU-9" }))?.balance ?? null);

      await wait(2200);
      if (cancelled) return;
      await stock.append({
        locationId: loc,
        lotId: "LOT-1",
        ownerId: "SKU-9",
        outAmount: "40",
        entryType: "issue",
        entryTypeId: "gi-1",
      });
      setStep(3);
      setBalance((await stock.snapshot({ locationId: loc, lotId: "LOT-1", ownerId: "SKU-9" }))?.balance ?? null);

      await wait(2200);
      if (cancelled) return;
      const ok = await stock.verify({
        locationId: loc,
        lotId: "LOT-1",
        ownerId: "SKU-9",
      });
      setStep(ok.ok ? 4 : 0);
      await wait(2600);
      if (!cancelled) void cycle();
    }

    void cycle();
    return () => {
      cancelled = true;
    };
  }, [parts]);

  return (
    <DemoShell
      live="Live · stock movement"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          on-hand {balance ?? "—"}
        </span>
      }
      className={className}
    >
      <div className="rounded-lg border border-border/70 bg-muted/30 px-2.5 py-2">
        <p className="font-mono text-[9px] tracking-wide text-muted-foreground uppercase">
          location parts → id
        </p>
        <ul className="mt-1 space-y-0.5 font-mono text-[11px]">
          {parts.map((p) => (
            <li key={p.key}>
              <span className="text-muted-foreground">{p.key}=</span>
              {p.value}
            </li>
          ))}
        </ul>
        <p className="mt-1.5 truncate font-mono text-[10px] text-foreground">
          {locationId || "…"}
        </p>
      </div>

      <ol className="mt-3 flex flex-wrap gap-1">
        {["compose", "receipt +100", "issue −40", "verify"].map((label, i) => (
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
        Demo store in-browser — production uses Drizzle ledgers.
      </p>
    </DemoShell>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
