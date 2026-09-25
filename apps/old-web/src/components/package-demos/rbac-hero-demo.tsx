"use client";

import { useEffect, useMemo, useState } from "react";
import { createMemoryRbacStore, createRbac } from "@eristack/rbac";
import {
  DecisionBadge,
  DemoShell,
} from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

const PERMS = [
  "orders.read",
  "orders.create",
  "orders.approve",
  "reports.export",
] as const;

const SCENES = [
  { subject: "clerk", try: "orders.create" as const, roles: ["clerk"] },
  { subject: "clerk", try: "orders.approve" as const, roles: ["clerk"] },
  { subject: "manager", try: "orders.approve" as const, roles: ["manager"] },
  {
    subject: "auditor",
    try: "reports.export" as const,
    roles: ["auditor"],
  },
];

/**
 * RBAC hero: role → permission matrix with live can().
 */
export function RbacHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [matrix, setMatrix] = useState<Record<string, boolean>>({});

  const ready = useMemo(() => {
    const rbac = createRbac({ store: createMemoryRbacStore() });
    const boot = (async () => {
      for (const name of PERMS) {
        await rbac.definePermission({ name });
      }
      await rbac.defineRole({
        name: "clerk",
        permissions: ["orders.read", "orders.create"],
      });
      await rbac.defineRole({
        name: "manager",
        permissions: ["orders.read", "orders.create", "orders.approve"],
      });
      await rbac.defineRole({
        name: "auditor",
        permissions: ["orders.read", "reports.export"],
      });
      await rbac.assignRole({ subject: "clerk", role: "clerk" });
      await rbac.assignRole({ subject: "manager", role: "manager" });
      await rbac.assignRole({ subject: "auditor", role: "auditor" });
      return rbac;
    })();
    return boot;
  }, []);

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
      const rbac = await ready;
      const next: Record<string, boolean> = {};
      for (const perm of PERMS) {
        next[perm] = await rbac.can(scene.subject, perm);
      }
      const ok = await rbac.can(scene.subject, scene.try);
      if (!cancelled) {
        setMatrix(next);
        setAllowed(ok);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, scene]);

  return (
    <DemoShell
      live="Live · can(subject, permission)"
      badge={<DecisionBadge allowed={allowed} />}
      className={className}
    >
      <p className="text-[13px] font-medium">
        <span className="font-mono text-[color:var(--layer-accent)]">
          {scene.subject}
        </span>{" "}
        tries{" "}
        <span className="font-mono text-foreground">{scene.try}</span>
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        roles: {scene.roles.join(", ")}
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
        <div className="grid grid-cols-[1.4fr_repeat(4,0.7fr)] gap-px bg-border/50 font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
          <div className="bg-muted/70 px-1.5 py-1">perm</div>
          {PERMS.map((p) => (
            <div key={p} className="bg-muted/70 px-1 py-1 text-center">
              {p.split(".")[1]}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1.4fr_repeat(4,0.7fr)] gap-px bg-border/30 font-mono text-[11px]">
          <div className="bg-background px-1.5 py-2 text-muted-foreground">
            {scene.subject}
          </div>
          {PERMS.map((perm) => {
            const on = matrix[perm];
            const probing = perm === scene.try;
            return (
              <div
                key={perm}
                className={cn(
                  "bg-background px-1 py-2 text-center transition-colors",
                  probing && "ring-1 ring-inset ring-[color:var(--layer-accent)]",
                  on
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-600/80 dark:text-rose-300/80",
                )}
              >
                {on == null ? "·" : on ? "✓" : "✗"}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Boolean only — roles grant named permissions; no attribute math here.
      </p>
    </DemoShell>
  );
}
