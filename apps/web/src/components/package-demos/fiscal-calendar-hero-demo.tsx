"use client";

import { useEffect, useMemo, useState } from "react";
import {
  assertPeriodOpen,
  createFiscalCalendar,
  findPeriodForDate,
} from "@eristack/fiscal-calendar";
import { wallOf } from "@eristack/timestamp";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const TZ = "Asia/Jakarta";

const CALENDAR = createFiscalCalendar({
  id: "demo",
  timezone: TZ,
  years: [
    {
      year: 2026,
      periods: [
        {
          id: "2026-p01",
          fiscalYear: 2026,
          periodNumber: 1,
          start: "2026-01-01",
          end: "2026-01-31",
          status: "closed",
        },
        {
          id: "2026-p02",
          fiscalYear: 2026,
          periodNumber: 2,
          start: "2026-02-01",
          end: "2026-02-28",
          status: "open",
        },
        {
          id: "2026-p03",
          fiscalYear: 2026,
          periodNumber: 3,
          start: "2026-03-01",
          end: "2026-03-31",
          status: "open",
        },
      ],
    },
  ],
});

const SCENES = [
  {
    label: "January post (closed)",
    date: "2026-01-15T00:00:00",
    hint: "Closed period — assertPeriodOpen throws before GL post.",
  },
  {
    label: "February post (open)",
    date: "2026-02-10T00:00:00",
    hint: "Wall local date resolves to open P02 — posting allowed.",
  },
  {
    label: "End-of-day wall date",
    date: "2026-03-31T23:59:59",
    hint: "Matches calendar date YYYY-MM-DD — not broken by time-of-day.",
  },
] as const;

/**
 * Fiscal calendar hero: findPeriodForDate + open/closed gate.
 */
export function FiscalCalendarHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const scene = SCENES[index]!;

  const resolved = useMemo(() => {
    const date = wallOf(scene.date, TZ);
    const period = findPeriodForDate(CALENDAR, date);
    let open = false;
    try {
      if (period) {
        assertPeriodOpen(period);
        open = true;
      }
    } catch {
      open = false;
    }
    return { period, open };
  }, [scene.date]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <DemoShell
      live="Live · findPeriodForDate(wallDate)"
      badge={
        <span
          className={cn(
            "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase",
            resolved.open
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
          )}
        >
          {resolved.period ? (resolved.open ? "open" : "closed") : "none"}
        </span>
      }
      className={className}
    >
      <p className="text-[13px] font-medium">{scene.label}</p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        {scene.date.slice(0, 10)} · {TZ}
      </p>

      {resolved.period ? (
        <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="rounded-lg border border-border/70 px-2 py-1.5">
            <dt className="text-muted-foreground">period</dt>
            <dd className="text-foreground">
              FY{resolved.period.fiscalYear}-P
              {String(resolved.period.periodNumber).padStart(2, "0")}
            </dd>
          </div>
          <div className="rounded-lg border border-border/70 px-2 py-1.5">
            <dt className="text-muted-foreground">range</dt>
            <dd className="text-[10px] text-foreground">
              {resolved.period.start} → {resolved.period.end}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          No period for date
        </p>
      )}

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        {scene.hint}
      </p>
    </DemoShell>
  );
}
