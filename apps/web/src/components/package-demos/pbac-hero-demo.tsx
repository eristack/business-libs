"use client";

import { useEffect, useMemo, useState } from "react";
import { createPbac } from "@eristack/pbac";
import {
  DecisionBadge,
  DemoShell,
} from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type DocState = {
  status: "draft" | "submitted" | "approved" | "closed";
  outstandingMinor: number;
  locked: boolean;
};

const FLOW = ["draft", "submitted", "approved", "closed"] as const;

const SCENES: { label: string; action: string; doc: DocState }[] = [
  {
    label: "Edit while draft",
    action: "po.edit-unlocked",
    doc: { status: "draft", outstandingMinor: 0, locked: false },
  },
  {
    label: "Receive open qty",
    action: "po.receive",
    doc: { status: "approved", outstandingMinor: 12_000, locked: false },
  },
  {
    label: "Receive fully closed",
    action: "po.receive",
    doc: { status: "approved", outstandingMinor: 0, locked: false },
  },
  {
    label: "Edit when locked",
    action: "po.edit-unlocked",
    doc: { status: "submitted", outstandingMinor: 5_000, locked: true },
  },
];

/**
 * PBAC hero: document state machine + stacked software policies.
 */
export function PbacHeroDemo({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | undefined>();

  const pbac = useMemo(() => {
    const api = createPbac();
    api.registerPolicy({
      id: "po.edit-unlocked",
      evaluate: (input) => {
        const status = input.document.status;
        if (status !== "draft" && status !== "submitted") {
          return {
            allowed: false,
            policyId: "po.edit-unlocked",
            reason: "status must be draft or submitted",
          };
        }
        if (input.document.locked) {
          return {
            allowed: false,
            policyId: "po.edit-unlocked",
            reason: "PO is locked",
          };
        }
        return { allowed: true, policyId: "po.edit-unlocked" };
      },
    });
    api.registerPolicy({
      id: "po.receive",
      evaluate: (input) => {
        const status = input.document.status;
        if (status !== "approved") {
          return {
            allowed: false,
            policyId: "po.receive",
            reason: "status must be approved",
          };
        }
        const n = Number(input.document.outstandingMinor);
        if (!Number.isFinite(n) || n <= 0) {
          return {
            allowed: false,
            policyId: "po.receive",
            reason: "Nothing left to receive",
          };
        }
        return { allowed: true, policyId: "po.receive" };
      },
    });
    return api;
  }, []);

  const scene = SCENES[index]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const decision = await pbac.check(scene.action, {
        document: { id: "po_1", ...scene.doc },
      });
      if (!cancelled) {
        setAllowed(decision.allowed);
        setReason(decision.reason);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pbac, scene]);

  return (
    <DemoShell
      live="Live · document policies"
      badge={<DecisionBadge allowed={allowed} />}
      className={className}
    >
      <p className="text-[13px] font-medium">{scene.label}</p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        action <span className="text-foreground">{scene.action}</span>
      </p>

      <ol className="mt-4 flex items-center gap-1">
        {FLOW.map((step, i) => {
          const active = scene.doc.status === step;
          return (
            <li key={step} className="flex flex-1 items-center gap-1">
              <div
                className={cn(
                  "w-full rounded-md px-1 py-1.5 text-center font-mono text-[9px] uppercase tracking-wide transition-colors",
                  active
                    ? "bg-[color:var(--layer-accent)] text-white"
                    : "bg-muted/60 text-muted-foreground",
                )}
              >
                {step}
              </div>
              {i < FLOW.length - 1 ? (
                <span className="text-[10px] text-muted-foreground">→</span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="rounded-lg border border-border/70 px-2 py-1.5">
          <dt className="text-muted-foreground">outstanding</dt>
          <dd className="tabular-nums text-foreground">
            {(scene.doc.outstandingMinor / 100).toFixed(2)}
          </dd>
        </div>
        <div className="rounded-lg border border-border/70 px-2 py-1.5">
          <dt className="text-muted-foreground">locked</dt>
          <dd
            className={cn(
              scene.doc.locked
                ? "text-rose-600 dark:text-rose-300"
                : "text-foreground",
            )}
          >
            {String(scene.doc.locked)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        {allowed
          ? "Business state allows the action — not an authz deny."
          : (reason ?? "Software policy blocks the action (HTTP 409).")}
      </p>
    </DemoShell>
  );
}
