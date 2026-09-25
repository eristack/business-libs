"use client";

import { useEffect, useState } from "react";
import {
  createEpoch,
  createMemoryEpochStore,
  type CachePolicy,
} from "@eristack/epoch";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const SCOPE = "orders";

const SCENES = [
  {
    label: "Fresh cache",
    clientEpoch: 2,
    serverEpoch: 2,
    hint: "Client saw epoch 2; server still at 2.",
  },
  {
    label: "After mutation",
    clientEpoch: 2,
    serverEpoch: 3,
    hint: "Receipt posted → bump(\"orders\"); client still holds 2.",
  },
  {
    label: "Synced",
    clientEpoch: 3,
    serverEpoch: 3,
    hint: "Query refetched; client epoch matches server.",
  },
] as const;

function PolicyBadge({ policy }: { policy: CachePolicy | null }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase transition-colors duration-300",
        policy === null
          ? "bg-muted text-muted-foreground"
          : policy === "use-cache"
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/15 text-amber-800 dark:text-amber-200",
      )}
    >
      {policy === null ? "…" : policy}
    </span>
  );
}

/**
 * Epoch hero: bump on mutation → resolveCachePolicy(use-cache | refetch).
 */
export function EpochHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [serverEpoch, setServerEpoch] = useState<number | null>(null);
  const [policy, setPolicy] = useState<CachePolicy | null>(null);

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
      const epoch = createEpoch({ store: createMemoryEpochStore() });
      for (let i = 0; i < scene.serverEpoch; i++) {
        await epoch.bump(SCOPE);
      }
      const resolved = await epoch.resolveCachePolicy(SCOPE, scene.clientEpoch);
      if (!cancelled) {
        setServerEpoch(resolved.current);
        setPolicy(resolved.policy);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scene]);

  return (
    <DemoShell
      live="Live · resolveCachePolicy(scope, clientEpoch)"
      badge={<PolicyBadge policy={policy} />}
      className={className}
    >
      <p className="text-[13px] font-medium">
        scope{" "}
        <span className="font-mono text-[color:var(--layer-accent)]">
          {SCOPE}
        </span>
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        {scene.label} — {scene.hint}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
          <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
            Client
          </p>
          <p className="mt-1 text-lg tabular-nums">{scene.clientEpoch}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
          <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
            Server
          </p>
          <p className="mt-1 text-lg tabular-nums">
            {serverEpoch == null ? "…" : serverEpoch}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Match →{" "}
        <span className="font-mono text-foreground">use-cache</span>; drift →{" "}
        <span className="font-mono text-foreground">refetch</span>. Bump after
        writes — not on every GET.
      </p>
    </DemoShell>
  );
}
