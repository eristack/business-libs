"use client";

import { useEffect, useMemo, useState } from "react";
import { defineRoutes, toOpenApiDocument } from "@eristack/rest";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    label: "GET /health",
    method: "GET" as const,
    path: "/health",
    hint: "Same route table mounts on Express or Nest — handlers stay in your app.",
  },
  {
    label: "GET /products",
    method: "GET" as const,
    path: "/products",
    hint: "dispatch() matches method + path — params extracted from :id segments.",
  },
  {
    label: "POST /products",
    method: "POST" as const,
    path: "/products",
    hint: "toOpenApiDocument(routes) emits minimal OpenAPI 3.1 paths for codegen.",
  },
] as const;

/**
 * REST hero: defineRoutes → dispatch → OpenAPI emit.
 */
export function RestHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<number | null>(null);
  const [matched, setMatched] = useState<boolean | null>(null);

  const router = useMemo(
    () =>
      defineRoutes([
        {
          method: "GET",
          path: "/health",
          summary: "Liveness probe",
          tags: ["system"],
          handler: () => ({ status: 200, body: { ok: true } }),
        },
        {
          method: "GET",
          path: "/products",
          summary: "List products",
          tags: ["catalog"],
          handler: () => ({
            status: 200,
            body: {
              items: [{ id: "p-1", sku: "SKU-1" }],
              pageInfo: { page: 1, pageSize: 20, total: 1 },
            },
          }),
        },
        {
          method: "POST",
          path: "/products",
          summary: "Create product",
          tags: ["catalog"],
          handler: () => ({ status: 201, body: { id: "p-new" } }),
        },
      ]),
    [],
  );

  const openapi = useMemo(
    () => toOpenApiDocument(router.routes, { title: "Demo API", version: "0.1.0" }),
    [router.routes],
  );

  const scene = SCENES[index]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await router.dispatch({
        method: scene.method,
        path: scene.path,
      });
      if (!cancelled) {
        setMatched(result.matched);
        setStatus(result.matched ? result.response.status : null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, scene]);

  return (
    <DemoShell
      live="Live · defineRoutes / dispatch"
      badge={
        <span
          className={cn(
            "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase",
            matched
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          {matched === null ? "…" : matched ? status : "404"}
        </span>
      }
      className={className}
    >
      <p className="font-mono text-[13px] font-semibold text-foreground">
        <span className="text-muted-foreground">{scene.method}</span>{" "}
        {scene.path}
      </p>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
        OpenAPI paths · {Object.keys(openapi.paths).length} ·{" "}
        {openapi.info.title} v{openapi.info.version}
      </p>

      <ul className="mt-3 space-y-1">
        {router.routes.map((route) => (
          <li
            key={`${route.method}-${route.path}`}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[10px] transition-colors",
              route.method === scene.method && route.path === scene.path
                ? "bg-[color:var(--layer-accent)]/15 text-foreground"
                : "text-muted-foreground",
            )}
          >
            {route.method} {route.path}
            {route.summary ? (
              <span className="ml-2 opacity-70">· {route.summary}</span>
            ) : null}
          </li>
        ))}
      </ul>

      <ol className="mt-3 flex gap-1">
        {SCENES.map((s, i) => (
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
