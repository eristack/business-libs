"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  initialMultitabState,
  multitabReducer,
  pathForTab,
  syncStateForRouteVisit,
  type MultitabState,
  type Tab,
} from "@eristack/multitab";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const ROUTE_META: Record<string, { title: string; description?: string }> = {
  "/operations/jobs": { title: "Jobs", description: "Open jobs" },
  "/partners/list": { title: "Partners", description: "Masters" },
  "/reports/summary": { title: "Summary", description: "Dashboard" },
};

const SCRIPT = [
  { kind: "route" as const, path: "/operations/jobs" },
  { kind: "route" as const, path: "/partners/list" },
  { kind: "route" as const, path: "/reports/summary" },
  { kind: "route" as const, path: "/operations/jobs" },
  { kind: "empty" as const, path: "/" },
];

function resolveRouteTab(pathname: string) {
  return ROUTE_META[pathname] ?? null;
}

function orderedTabs(state: MultitabState): Tab[] {
  return [...state.tabs].sort((a, b) => a.sequence - b.sequence);
}

/**
 * Multitab hero: route-synced tab strip with adjacent insert semantics.
 */
export function MultitabHeroDemo({ className }: { className?: string }) {
  const [state, dispatch] = useReducer(multitabReducer, initialMultitabState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const [scriptIndex, setScriptIndex] = useState(0);
  const [pathname, setPathname] = useState("/operations/jobs");

  const tabs = useMemo(() => orderedTabs(state), [state]);
  const activeTabId = useMemo(() => {
    if (pathname === "/") return null;
    if (pathname.startsWith("/new/")) {
      return pathname.slice("/new/".length);
    }
    return pathname;
  }, [pathname]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setScriptIndex((i) => (i + 1) % SCRIPT.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const frame = SCRIPT[scriptIndex]!;
    setPathname(frame.path);
    const next = syncStateForRouteVisit(
      stateRef.current,
      frame.path,
      resolveRouteTab,
    );
    dispatch({ type: "replaceState", state: next });
  }, [scriptIndex]);

  return (
    <DemoShell
      live="Live · syncStateForRouteVisit()"
      badge={
        <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[8rem]">
          {pathname}
        </span>
      }
      className={className}
    >
      <div
        className="flex gap-1 overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-1"
        role="tablist"
      >
        {tabs.length === 0 ? (
          <span className="px-2 py-1 font-mono text-[10px] text-muted-foreground">
            empty workspace
          </span>
        ) : (
          tabs.map((tab) => {
            const active = tab.id === activeTabId;
            return (
              <span
                key={tab.id}
                role="tab"
                aria-selected={active}
                className={cn(
                  "max-w-[7rem] truncate rounded-md px-2 py-1 font-mono text-[10px] transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-[color:var(--layer-accent)]/30"
                    : "text-muted-foreground",
                )}
                title={pathForTab(tab)}
              >
                {tab.title}
              </span>
            );
          })
        )}
      </div>

      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {SCRIPT[scriptIndex]!.kind === "empty"
          ? "Navigate to / — tabs stay open, none active"
          : "Adjacent insert when opening detail routes after list tabs"}
      </p>

      <ol className="mt-2 flex flex-wrap gap-1">
        {SCRIPT.map((item, i) => (
          <li
            key={item.path}
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase transition-colors",
              i === scriptIndex
                ? "bg-[color:var(--layer-soft)] text-[color:var(--layer-accent)]"
                : "bg-muted text-muted-foreground",
            )}
          >
            {item.path === "/" ? "empty" : item.path.split("/").pop()}
          </li>
        ))}
      </ol>
    </DemoShell>
  );
}
