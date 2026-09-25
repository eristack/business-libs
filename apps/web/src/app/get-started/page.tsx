import Link from "next/link";
import { GetStartedCopy } from "@/components/get-started-copy";
import {
  agentKickoffPrompt,
  getStartedSteps,
  intentLoads,
  starterAgentsMd,
} from "@/lib/get-started-content";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Get started",
  description:
    "Skip catalog-shopping @eristack packages — copy AGENTS.md, let your coding agent load recipes, and scaffold a TypeScript monorepo around the right libraries.",
  path: "/get-started",
});

export default function GetStartedPage() {
  const agentsMdUrl = `${siteConfig.github}/blob/main/AGENTS.md`;

  return (
    <div className="border-b border-border">
      <div className="container-page py-14 sm:py-20">
        <p className="text-sm font-medium text-primary">Get started</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Let an agent pick the libraries
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Choosing from thirty-plus packages is the wrong first step. Copy a
          small{" "}
          <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-sm text-secondary">
            AGENTS.md
          </code>
          , point Cursor (or any agent) at your product, and load{" "}
          <code className="font-mono text-sm text-secondary">
            @eristack/ai-knowledge
          </code>{" "}
          so recipes — not guesswork — drive the monorepo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#agents-md" className="btn btn-primary">
            Copy starter AGENTS.md
          </a>
          <Link href="/products" className="btn btn-outline">
            Browse products later
          </Link>
          <a
            href={agentsMdUrl}
            className="btn btn-ghost"
            target="_blank"
            rel="noreferrer"
          >
            Full AGENTS.md on GitHub
          </a>
        </div>
      </div>

      <section className="border-t border-border bg-surface-raised">
        <div className="container-page py-14 sm:py-16">
          <h2 className="text-2xl font-semibold text-foreground">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {getStartedSteps.map((step, index) => (
              <li key={step.title} className="card">
                <span className="font-mono text-xs font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page py-14 sm:py-16">
          <h2 className="text-2xl font-semibold text-foreground">
            Intent skills to load first
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            TanStack Intent pulls the canonical guides into the agent context.
            These four cover routing, architecture, defaults, and workflow.
          </p>
          <ul className="mt-8 space-y-3">
            {intentLoads.map((item) => (
              <li
                key={item.skill}
                className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <code className="font-mono text-xs text-secondary">
                  pnpm dlx @tanstack/intent@latest load {item.skill}
                </code>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="agents-md" className="border-t border-border bg-surface-raised">
        <div className="container-page py-14 sm:py-16">
          <h2 className="text-2xl font-semibold text-foreground">
            Starter AGENTS.md
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Save as{" "}
            <code className="font-mono text-sm">AGENTS.md</code> at your repo
            root before the first scaffold. Adjust the product name and domains;
            keep the Intent load block.
          </p>
          <div className="mt-6">
            <GetStartedCopy
              label="Copy AGENTS.md"
              filename="AGENTS.md"
              text={starterAgentsMd}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page py-14 sm:py-16">
          <h2 className="text-2xl font-semibold text-foreground">
            Kickoff prompt
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            After AGENTS.md is in place, paste this into your agent chat and
            fill in the brackets.
          </p>
          <div className="mt-6">
            <GetStartedCopy
              label="Copy prompt"
              filename="agent-kickoff.txt"
              text={agentKickoffPrompt}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-neutral">
        <div className="container-page py-14 text-center sm:py-16">
          <h2 className="text-xl font-semibold text-foreground">
            When you need the catalog
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            Products and GitHub docs are for when you already know the package
            name. Agents should start with recommend — humans can browse when
            curious.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="btn btn-outline">
              Products
            </Link>
            <Link href="/docs" className="btn btn-ghost">
              Docs hub
            </Link>
            <a
              href={`${siteConfig.github}/tree/main/examples`}
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              examples/ on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
