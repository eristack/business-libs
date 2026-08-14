"use client";

import { useEffect, useMemo, useState } from "react";
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createErpDemoSnapshot } from "@eristack/backseat/seeds";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type LogLine = {
  method: string;
  path: string;
  status: number;
  note: string;
};

/**
 * Backseat hero: in-browser REST handle() against seeded ERP collections.
 */
export function BackseatHeroDemo({ className }: { className?: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [step, setStep] = useState(0);

  const api = useMemo(() => {
    const store = createMemoryBackseatStore();
    const backseat = createBackseat({
      store,
      baseUrl: "/api",
      collections: {
        products: {},
        partners: {},
        purchaseOrders: {},
      },
    });
    return backseat;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function cycle() {
      await api.seed(createErpDemoSnapshot());
      if (cancelled) return;

      const script: Array<{ req: Parameters<typeof api.handle>[0]; note: string }> = [
        {
          req: { method: "GET", path: "/api/products" },
          note: `${(await api.handlers.products.list()).length} products`,
        },
        {
          req: {
            method: "POST",
            path: "/api/products",
            body: { id: "p-new", sku: "NEW-01", name: "Demo widget" },
          },
          note: "create draft",
        },
        {
          req: { method: "GET", path: "/api/products/p-new" },
          note: "fetch by id",
        },
        {
          req: {
            method: "PATCH",
            path: "/api/products/p-new",
            body: { name: "Demo widget (updated)" },
          },
          note: "patch document",
        },
      ];

      setLines([]);
      setStep(0);

      for (let i = 0; i < script.length; i++) {
        const item = script[i]!;
        const res = await api.handle(item.req);
        if (cancelled) return;
        setLines((prev) => [
          ...prev,
          {
            method: item.req.method,
            path: item.req.path.replace("/api", ""),
            status: res.status,
            note: item.note,
          },
        ]);
        setStep(i + 1);
        await wait(1800);
      }

      await wait(2200);
      if (!cancelled) void cycle();
    }

    void cycle();
    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <DemoShell
      live="Live · api.handle()"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          step {step}/4
        </span>
      }
      className={className}
    >
      <p className="font-mono text-[11px] text-muted-foreground">
        IndexedDB in apps · memory store here
      </p>

      <ul className="mt-2 max-h-[9.5rem] space-y-1 overflow-hidden font-mono text-[11px]">
        {lines.map((line, i) => (
          <li
            key={`${line.method}-${line.path}-${i}`}
            className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1"
          >
            <span>
              <span
                className={cn(
                  "mr-1.5 font-semibold",
                  line.status < 300
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300",
                )}
              >
                {line.status}
              </span>
              {line.method}{" "}
              <span className="text-muted-foreground">{line.path}</span>
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              {line.note}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        registerRoute + registerAction — no shared REST contract with production.
      </p>
    </DemoShell>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
