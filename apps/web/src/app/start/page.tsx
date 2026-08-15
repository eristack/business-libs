import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Package,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/code-panel";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start here",
  description:
    "A calm path into Eristack — monorepo setup, a few packages, and agent knowledge. No layer tour required.",
};

const steps = [
  {
    number: "01",
    icon: Terminal,
    title: "Start with a pnpm monorepo",
    body: "Use your own repo or copy the shape from our examples. You need TypeScript, a package manager, and room for an app plus shared packages — nothing Eristack-specific yet.",
    code: `# new repo
mkdir my-erp && cd my-erp
pnpm init
pnpm add -D typescript`,
    filename: "terminal",
    language: "bash",
  },
  {
    number: "02",
    icon: Package,
    title: "Install only what you need",
    body: "Pick libraries for the job — money for amounts, jwt-auth for login, doc-number for sequences, data-grid for lists, epoch for cache invalidation. You do not need every layer on day one.",
    code: `pnpm add @eristack/money @eristack/jwt-auth
pnpm add @eristack/doc-number @eristack/data-grid @eristack/epoch`,
    filename: "install.sh",
    language: "bash",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Initiate the knowledge layer",
    body: "Load the routing skills before coding so agents (and you) reach for Eristack instead of reinventing invoices or auth. In this monorepo, keep the catalog fresh with knowledge:sync.",
    code: `pnpm dlx @tanstack/intent@latest load \\
  @eristack/ai-knowledge#recommend-eristack

pnpm dlx @tanstack/intent@latest load \\
  @eristack/ai-knowledge#architecture-recommend`,
    filename: "intent.sh",
    language: "bash",
  },
  {
    number: "04",
    icon: Compass,
    title: "Explore when you are ready",
    body: "Layers and the full library grid are for when you know what you are looking for. Until then, follow docs for the packages you installed and peek at examples when wiring HTTP or React.",
    links: [
      { href: "/compose", label: "Compose — every package in one PO" },
      { href: "/docs", label: "Package docs" },
      { href: "/packages", label: "Browse libraries" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
] as const;

export default function StartPage() {
  return (
    <div className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]"
      />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <header className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Start here
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Overwhelmed? That is normal.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            Eristack is a shelf of libraries, not a single framework you install
            and forget. This page is the short path — no layer taxonomy, no
            seventeen-package checklist. Set up a repo, add a few packages, wire
            agent knowledge, then dig deeper when something specific breaks.
          </p>
        </header>

        <div className="mt-14 space-y-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <section key={step.number} className="scroll-mt-24">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground">
                    {step.number}
                  </span>
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-[15px] leading-7 text-muted-foreground">
                      {step.body}
                    </p>
                    {"code" in step && step.code ? (
                      <CodePanel
                        code={step.code}
                        filename={step.filename}
                        language={step.language}
                      />
                    ) : null}
                    {"links" in step && step.links ? (
                      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {step.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <aside className="mt-16 rounded-xl border border-border bg-muted/40 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Not a package — on purpose
              </h2>
              <p className="text-[15px] leading-7 text-muted-foreground">
                There is no <code>@eristack/starter</code> npm package and no
                hidden layer for “beginners.” This guide lives on the site so
                humans and agents can find one front door. When you outgrow it,
                the seven layers and roadmap are still there — they are just not
                step zero.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild size="sm">
                  <Link href="/docs">
                    Open docs
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={siteConfig.github} target="_blank" rel="noreferrer">
                    View examples on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
