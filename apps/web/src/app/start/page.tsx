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
import { ContentSection } from "@/components/stack/content-section";
import { PageHero } from "@/components/stack/page-hero";

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
    <>
      <PageHero
        tone="marketing"
        eyebrow={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Start here
          </span>
        }
        title="Overwhelmed? That is normal."
        tagline="Eristack is a shelf of libraries, not a single framework you install and forget."
        description="This page is the short path — no layer taxonomy, no seventeen-package checklist. Set up a repo, add a few packages, wire agent knowledge, then dig deeper when something specific breaks."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/docs">
                Open docs
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/packages">Browse libraries</Link>
            </Button>
          </>
        }
      />

      <ContentSection tone="muted" eyebrow="Four steps" title="The calm path">
        <div className="space-y-12">
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
                      <ul className="flex flex-col gap-2 pt-1">
                        {step.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:underline"
                            >
                              <BookOpen className="size-3.5 opacity-70" />
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
      </ContentSection>
    </>
  );
}
