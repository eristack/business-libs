import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComposeExplorer } from "@/components/stack-compose/compose-explorer";
import { packages } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compose",
  description:
    "One document-with-lines flow through every @eristack package — annotated backend and frontend code so you know when to reach for each library.",
};

const flow = [
  "Agent knowledge",
  "Login",
  "List jobs",
  "Create job",
  "Submit",
  "Material issue",
  "Post GL",
  "Workspace",
] as const;

export default function ComposePage() {
  return (
    <>
      <section className="relative overflow-x-hidden border-b-2 border-foreground/10 bg-docs-rail">
        <div className="pointer-events-none absolute inset-0 hero-noise" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Compose Eristack
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              One job document. Every package. Tagged in context.
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              Real operational apps are never “just auth” or “just money.” This page walks
              a document-with-lines job from login through optional inventory and GL
              posting — in three fixed files:{" "}
              <span className="font-mono text-foreground">server/documents.ts</span>,{" "}
              <span className="font-mono text-foreground">src/routes/job.tsx</span>, and a{" "}
              <span className="font-mono text-foreground">terminal</span> for agent
              tooling. Switch tabs to see backend vs frontend vs Intent; use the
              scenario rail to jump to the lines that matter.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href="/packages">
                  Browse libraries
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/start">Start here</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-border/80 bg-background/80 p-4 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              <Layers className="size-3.5" />
              Procure-to-pay spine
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {flow.map((label, index) => (
                <span key={label} className="flex items-center gap-2">
                  <span className="rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[12px] font-medium text-foreground">
                    {label}
                  </span>
                  {index < flow.length - 1 ? (
                    <span className="text-muted-foreground/50">→</span>
                  ) : null}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
              Covers all{" "}
              <span className="font-semibold text-foreground">
                {packages.length} libraries
              </span>{" "}
              — primitive money through AI workflow. Features modules (full PO
              product packages) are on the roadmap; the spine underneath is what
              you wire today.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <ComposeExplorer />
      </div>
    </>
  );
}
