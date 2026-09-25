"use client";

import { useEffect, useState } from "react";
import * as jose from "jose";
import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

type Step = {
  label: string;
  detail: string;
  status: "pending" | "active" | "done";
};

const SECRET = new TextEncoder().encode("hero-demo-secret-min-16-ch");

/**
 * JWT auth hero — browser-safe issue/verify via jose (same primitive as
 * @eristack/jwt-auth). Password scrypt + refresh stores run on the server.
 */
export function JwtAuthHeroDemo({ className }: { className?: string }) {
  const [highlight, setHighlight] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [subject, setSubject] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHighlight((i) => (i + 1) % 4);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setSteps([
        { label: "issue", detail: "access + refresh pair", status: "pending" },
        { label: "verify", detail: "access JWT claims", status: "pending" },
        { label: "refresh", detail: "rotate opaque token", status: "pending" },
        { label: "reuse", detail: "reject old refresh", status: "pending" },
      ]);

      const mark = (idx: number, status: Step["status"], detail?: string) => {
        if (cancelled) return;
        setSteps((prev) =>
          prev.map((step, i) =>
            i === idx
              ? { ...step, status, detail: detail ?? step.detail }
              : step,
          ),
        );
      };

      mark(0, "active");
      const accessToken = await new jose.SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject("user-hero")
        .setIssuer("eristack-hero")
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(SECRET);
      const refreshToken = crypto.randomUUID();
      mark(0, "done", `refresh ${refreshToken.slice(0, 8)}…`);
      if (cancelled) return;

      mark(1, "active");
      const verified = await jose.jwtVerify(accessToken, SECRET, {
        issuer: "eristack-hero",
      });
      setSubject(verified.payload.sub ?? null);
      mark(1, "done", `sub ${verified.payload.sub}`);
      if (cancelled) return;

      mark(2, "active");
      const rotatedRefresh = crypto.randomUUID();
      mark(2, "done", `→ ${rotatedRefresh.slice(0, 8)}…`);
      if (cancelled) return;

      mark(3, "active");
      await wait(400);
      mark(3, "done", `${refreshToken.slice(0, 8)}… rejected`);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DemoShell
      live="Live · JWT session"
      badge={
        <span className="font-mono text-[10px] text-[color:var(--layer-accent)]">
          {subject ? `sub ${subject}` : "boot…"}
        </span>
      }
      className={className}
    >
      <ol className="space-y-1.5">
        {steps.map((step, i) => {
          const featured = i === highlight;
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-start justify-between gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
                featured
                  ? "border-[color:var(--layer-accent)]/40 bg-[color:var(--layer-soft)]"
                  : "border-border/60 bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "font-semibold uppercase tracking-wide",
                  step.status === "done"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : step.status === "active"
                      ? "text-[color:var(--layer-accent)]"
                      : "text-muted-foreground",
                )}
              >
                {step.status === "done" ? "✓" : step.status === "active" ? "→" : "·"}{" "}
                {step.label}
              </span>
              <span className="text-right text-muted-foreground">{step.detail}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        Hero uses jose in-browser;{" "}
        <span className="font-mono text-[11px]">@eristack/jwt-auth</span> adds
        scrypt credentials, refresh stores, and Drizzle adapters on the server.
      </p>
    </DemoShell>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
