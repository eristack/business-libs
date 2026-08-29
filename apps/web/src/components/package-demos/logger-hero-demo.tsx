"use client";

import { useEffect, useMemo, useState } from "react";
import { createLogger } from "@eristack/logger";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type Scene = {
  label: string;
  hint: string;
  run: (lines: string[]) => void;
};

function parseLine(line: string): Record<string, unknown> {
  try {
    return JSON.parse(line) as Record<string, unknown>;
  } catch {
    return { raw: line };
  }
}

/**
 * Logger hero: JSON-lines events with request-scoped child loggers.
 */
export function LoggerHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  const scenes = useMemo<Scene[]>(
    () => [
      {
        label: "Request scope",
        hint: "Child logger merges requestId on every line — same shape on Express and Nest.",
        run: (sink) => {
          sink.length = 0;
          const log = createLogger({
            name: "api",
            sink: (line) => sink.push(line),
          });
          const reqLog = log.child({
            requestId: "req_8f2a",
            userId: "user_18f2",
          });
          reqLog.info("request.start", { method: "GET", path: "/orders" });
          reqLog.info("request.finish", { status: 200, ms: 42 });
        },
      },
      {
        label: "Structured warn",
        hint: "One JSON object per line — Vercel and log drains parse without regex.",
        run: (sink) => {
          sink.length = 0;
          const log = createLogger({
            name: "api",
            sink: (line) => sink.push(line),
          });
          log.warn("cache.stale", {
            scope: "orders",
            clientEpoch: 6,
            serverEpoch: 7,
          });
        },
      },
      {
        label: "Error normalize",
        hint: "error level attaches normalized { name, message, stack } — not stringified throws.",
        run: (sink) => {
          sink.length = 0;
          const log = createLogger({
            name: "api",
            sink: (line) => sink.push(line),
          });
          log.error(
            "handler.failed",
            new Error("POLICY_DENIED"),
            { route: "POST /receipts" },
          );
        },
      },
    ],
    [],
  );

  const scene = scenes[index]!;

  useEffect(() => {
    const sink: string[] = [];
    scene.run(sink);
    setLines([...sink]);
  }, [scene]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % scenes.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [scenes.length]);

  const last = lines[lines.length - 1];
  const parsed = last ? parseLine(last) : null;

  return (
    <DemoShell
      live="Live · createLogger()"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {scene.label}
        </span>
      }
      className={className}
    >
      <pre className="max-h-[7.5rem] overflow-auto rounded-xl border border-border/70 bg-muted/40 p-2.5 font-mono text-[10px] leading-5 text-foreground">
        {lines.map((line) => (
          <span key={line} className="block break-all">
            {line}
          </span>
        ))}
      </pre>

      {parsed ? (
        <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px]">
          <div className="rounded-lg border border-border/70 px-2 py-1.5">
            <dt className="text-muted-foreground">level</dt>
            <dd className="uppercase text-foreground">
              {String(parsed.level ?? "—")}
            </dd>
          </div>
          <div className="rounded-lg border border-border/70 px-2 py-1.5">
            <dt className="text-muted-foreground">context</dt>
            <dd className="truncate text-foreground">
              {parsed.context &&
              typeof parsed.context === "object" &&
              "requestId" in (parsed.context as object)
                ? String(
                    (parsed.context as { requestId?: string }).requestId,
                  )
                : "—"}
            </dd>
          </div>
        </dl>
      ) : null}

      <ol className="mt-3 flex gap-1">
        {scenes.map((s, i) => (
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
