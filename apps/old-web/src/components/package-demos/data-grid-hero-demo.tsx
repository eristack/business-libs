"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyInMemory,
  createDataGrid,
  type DataGridSchema,
} from "@eristack/data-grid";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  customer: string;
  status: string;
  total: string;
};

const ROWS: Order[] = [
  { id: "o1", customer: "Ada", status: "open", total: "120.00" },
  { id: "o2", customer: "Grace", status: "open", total: "45.50" },
  { id: "o3", customer: "Ada", status: "closed", total: "900.00" },
  { id: "o4", customer: "Linus", status: "open", total: "12.00" },
  { id: "o5", customer: "Grace", status: "closed", total: "220.00" },
  { id: "o6", customer: "Ken", status: "open", total: "340.00" },
];

const SCHEMA = {
  fields: [
    { name: "id", type: "string", filterable: true, sortable: true },
    {
      name: "customer",
      type: "string",
      filterable: true,
      searchable: true,
      sortable: true,
    },
    { name: "status", type: "string", filterable: true, sortable: true },
    { name: "total", type: "string", filterable: true, sortable: true },
  ],
  defaultPageSize: 10,
  maxPageSize: 50,
} satisfies DataGridSchema;

const SCENES = [
  {
    label: "Search",
    chips: ["mode:search", "q:Ada"],
    input: { mode: "search" as const, q: "Ada", page: 1, pageSize: 10 },
  },
  {
    label: "Filter + sort",
    chips: ["status eq open", "sort total desc"],
    input: {
      mode: "advanced" as const,
      filters: {
        type: "clause" as const,
        field: "status",
        op: "eq" as const,
        value: "open",
      },
      sorts: [{ field: "total", dir: "desc" as const }],
      page: 1,
      pageSize: 10,
    },
  },
  {
    label: "Between + and",
    chips: ["total between", "100…500"],
    input: {
      mode: "advanced" as const,
      filters: {
        type: "group" as const,
        logic: "and" as const,
        children: [
          {
            type: "clause" as const,
            field: "total",
            op: "between" as const,
            value: ["100", "500"],
          },
          {
            type: "clause" as const,
            field: "status",
            op: "eq" as const,
            value: "open",
          },
        ],
      },
      page: 1,
      pageSize: 10,
    },
  },
];

/**
 * Data-grid hero: query pipeline chips → filtered table.
 */
export function DataGridHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const grid = useMemo(() => createDataGrid(SCHEMA), []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const scene = SCENES[index]!;
  const parsed = grid.parse(scene.input);
  const result = applyInMemory(ROWS, parsed, SCHEMA, (row, field) =>
    row[field as keyof Order],
  );
  const total =
    result.pageInfo.mode === "offset"
      ? result.pageInfo.total
      : result.items.length;

  return (
    <DemoShell
      live="Live · parse → applyInMemory"
      badge={
        <span className="font-mono text-[11px] text-[color:var(--layer-accent)]">
          {scene.label}
        </span>
      }
      className={className}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {scene.chips.map((chip, i) => (
          <span key={chip} className="flex items-center gap-1.5">
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
              {chip}
            </span>
            {i < scene.chips.length - 1 ? (
              <span className="text-[10px] text-muted-foreground">→</span>
            ) : null}
          </span>
        ))}
        <span className="text-[10px] text-muted-foreground">→</span>
        <span className="rounded-md bg-[color:var(--layer-accent)]/15 px-2 py-0.5 font-mono text-[10px] text-foreground">
          {total}/{ROWS.length} rows
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr] gap-px bg-border/50 font-mono text-[9px] tracking-wide text-muted-foreground uppercase">
          <div className="bg-muted/70 px-2 py-1">Customer</div>
          <div className="bg-muted/70 px-2 py-1">Status</div>
          <div className="bg-muted/70 px-2 py-1 text-right">Total</div>
        </div>
        {ROWS.map((row) => {
          const hit = result.items.some((item) => item.id === row.id);
          return (
            <div
              key={row.id}
              className={cn(
                "grid grid-cols-[1.2fr_0.8fr_0.7fr] gap-px bg-border/30 font-mono text-[11px] transition-opacity duration-300",
                hit ? "opacity-100" : "opacity-25",
              )}
            >
              <div className="bg-background px-2 py-1.5">{row.customer}</div>
              <div className="bg-background px-2 py-1.5 text-muted-foreground">
                {row.status}
              </div>
              <div className="bg-background px-2 py-1.5 text-right tabular-nums">
                {row.total}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Mode <span className="font-mono text-foreground">{parsed.mode}</span> —
        dimmed rows fail the query; bright rows survive filter/sort/page.
      </p>
    </DemoShell>
  );
}
