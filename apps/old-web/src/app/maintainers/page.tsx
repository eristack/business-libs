import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { maintainers, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Maintainers",
  description: "Who builds and stewards Eristack.",
};

export default function MaintainersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Maintainers"
        title="People behind the packages"
        description="Eristack is a subsidiary of erista.id. Contributions welcome — stewardship stays opinionated about domain correctness."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {maintainers.map((person) => (
          <article
            key={person.name}
            className="rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-sm font-semibold tracking-tight text-background">
              {person.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {person.name}
            </h2>
            <p className="mt-1 text-[13px] font-medium text-foreground">
              {person.role}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {person.company} ·{" "}
              <a
                href={person.website}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                erista.id
              </a>
            </p>
            <p className="mt-4 text-[14px] leading-6 text-prose-body">
              {person.bio}
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-[13px] font-medium">
              <a
                href={person.github}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                GitHub →
              </a>
              <a
                href={person.website}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Erista →
              </a>
            </div>
          </article>
        ))}

        <article className="rounded-xl border border-dashed border-border bg-muted/50 p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Subsidiary of Erista
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
            Eristack libraries are extracted from product work at{" "}
            <a
              href={siteConfig.erista}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent hover:underline"
            >
              erista.id
            </a>
            . Issues, examples, and docs improvements are the fastest way to
            help. For larger changes, open a discussion first.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="sm">
              <a href={siteConfig.github} target="_blank" rel="noreferrer">
                Repository
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/story">Read the story</Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
