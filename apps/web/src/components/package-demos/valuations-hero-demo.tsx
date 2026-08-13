"use client";

import { useEffect, useState } from "react";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";
import {
  createMemoryLayerStore,
  createValuationEngine,
  type IssuePick,
} from "@eristack/valuations";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

/** Hero viz only — demo stores. Apps use Drizzle ledger + layer tables. */
export function ValuationsHeroDemo({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const [layers, setLayers] = useState<
    { id: string; qty: string; unitCost: string }[]
  >([]);
  const [picks, setPicks] = useState<IssuePick[]>([]);
  const [totalCost, setTotalCost] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = { productId: "SKU-1", lotId: "L1", currency: "USD" };

    async function cycle() {
      const engine = createValuationEngine({
        method: "fifo",
        ledger: { store: createMemoryLedgerStore() },
        layers: createMemoryLayerStore(),
      });
      setStep(0);
      setLayers([]);
      setPicks([]);
      setTotalCost(null);

      await engine.receive({
        key,
        qty: "10",
        unitCost: "2",
        entryTypeId: "po-a",
        layerId: "A",
        receivedAt: "2026-01-01T00:00:00.000Z",
      });
      if (cancelled) return;
      await engine.receive({
        key,
        qty: "10",
        unitCost: "3",
        entryTypeId: "po-b",
        layerId: "B",
        receivedAt: "2026-02-01T00:00:00.000Z",
      });
      setStep(1);
      setLayers(
        (await engine.layers(key)).map((l) => ({
          id: l.id,
          qty: l.qty,
          unitCost: l.unitCost,
        })),
      );

      await wait(2400);
      if (cancelled) return;
      const issued = await engine.issue({
        key,
        qty: "12",
        entryTypeId: "so-1",
      });
      setStep(2);
      setPicks(issued.result.picks);
      setTotalCost(issued.result.totalCost);
      setLayers(
        (await engine.layers(key)).map((l) => ({
          id: l.id,
          qty: l.qty,
          unitCost: l.unitCost,
        })),
      );

      await wait(2400);
      if (cancelled) return;
      const ok = await engine.verify(key);
      setStep(ok.qty && ok.value ? 3 : 0);
      await wait(2800);
      if (!cancelled) void cycle();
    }

    void cycle();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DemoShell
      live="Live · FIFO valuation"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          cost {totalCost ?? "—"}
        </span>
      }
      className={className}
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 font-mono text-[9px] text-muted-foreground uppercase">
            Layers
          </p>
          <ul className="space-y-1 font-mono text-[11px]">
            {layers.map((l) => (
              <li
                key={l.id}
                className="rounded-md border border-border/60 px-1.5 py-1"
              >
                {l.id} · {l.qty}@
                <span className="text-muted-foreground">{l.unitCost}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-mono text-[9px] text-muted-foreground uppercase">
            Issue picks
          </p>
          <ul className="space-y-1 font-mono text-[11px]">
            {picks.map((p) => (
              <li
                key={`${p.layerId}-${p.qty}`}
                className="rounded-md bg-muted/50 px-1.5 py-1"
              >
                {p.layerId} · {p.qty} → {p.cost}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ol className="mt-3 flex flex-wrap gap-1">
        {["receive layers", "issue 12 FIFO", "verify chains"].map(
          (label, i) => (
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
          ),
        )}
      </ol>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Demo stores in-browser — production uses Drizzle entries + layers.
      </p>
    </DemoShell>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
