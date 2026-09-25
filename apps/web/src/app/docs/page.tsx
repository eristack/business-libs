import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Documentation",
  description:
    "Eristack library documentation hub — package guides live in the monorepo; full doc browsing is being rebuilt.",
  path: "/docs",
});

export default function DocsHubPage() {
  return (
    <div className="container-page py-16 sm:py-24">
      <p className="text-sm font-medium text-tertiary">Docs</p>
      <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-neutral">
        Documentation hub
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Package guides remain the source of truth under{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm">
          packages/*/docs
        </code>
        . The previous site renderer lives in{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm">
          apps/old-web
        </code>{" "}
        while we ship this marketing-first experience.
      </p>
      <ul className="mt-10 space-y-4 text-neutral">
        <li className="card">
          <p className="font-medium">Read on GitHub</p>
          <p className="mt-1 text-sm text-muted">
            Browse markdown guides per package in the business-libs repo.
          </p>
          <Link
            href={siteConfig.github}
            className="mt-3 inline-block text-sm text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Open repository →
          </Link>
        </li>
        <li className="card">
          <p className="font-medium">Install from npm</p>
          <p className="mt-1 text-sm text-muted">
            Each product page lists the current version and npm link.
          </p>
          <Link href="/products" className="mt-3 inline-block text-sm text-primary hover:underline">
            Browse products →
          </Link>
        </li>
        <li className="card">
          <p className="font-medium">Agents</p>
          <p className="mt-1 text-sm text-muted">
            Load{" "}
            <code className="font-mono text-xs">@eristack/ai-knowledge#recommend-eristack</code>{" "}
            before wiring features from scratch.
          </p>
        </li>
      </ul>
    </div>
  );
}
