import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsHubRecommendExamples } from "@/lib/docs-hub-recommend";

export function DocsHubRecommend() {
  const examples = docsHubRecommendExamples();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {examples.map((example) => (
        <div
          key={example.query}
          className="rounded-xl border border-border/70 bg-card/60 p-4"
        >
          <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Ask agents
          </p>
          <p className="mt-1.5 font-mono text-[12px] text-foreground/90">
            &ldquo;{example.query}&rdquo;
          </p>
          {example.recipe ? (
            <>
              <p className="mt-3 text-[13px] font-semibold text-foreground">
                → {example.recipe}
              </p>
              {example.packages.length > 0 ? (
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {example.packages.join(" · ")}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">
              No recipe match — load{" "}
              <span className="font-mono text-[11px]">recommend-eristack</span>{" "}
              first.
            </p>
          )}
        </div>
      ))}
      <Link
        href="/docs/ai-knowledge/recommend"
        className="group flex flex-col justify-center rounded-xl border border-dashed border-violet-500/30 bg-violet-500/[0.04] p-4 transition-colors hover:border-violet-500/45 hover:bg-violet-500/[0.07] sm:col-span-2"
      >
        <p className="text-[13px] font-semibold text-foreground">
          Full recommend() guide
        </p>
        <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground group-hover:text-accent">
          How agents route product language to @eristack packages
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </p>
      </Link>
    </div>
  );
}
