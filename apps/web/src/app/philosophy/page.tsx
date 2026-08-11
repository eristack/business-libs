import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { tenets } from "@/lib/site";

export const metadata: Metadata = {
  title: "Philosophy",
  description: "Product tenets that guide Eristack libraries.",
};

export default function PhilosophyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Philosophy"
        title="Product tenets"
        description="These aren’t slogans for a pitch deck. They’re the constraints we use when deciding what belongs in a package — and what must stay in your app."
      />

      <ol className="mt-12 grid gap-0 border-t border-border md:grid-cols-2">
        {tenets.map((tenet, index) => (
          <li
            key={tenet.title}
            className="border-b border-border py-8 md:odd:border-r md:odd:pr-8 md:even:pl-8"
          >
            <p className="font-mono text-[11px] text-accent">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              {tenet.title}
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-7 text-muted-foreground">
              {tenet.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/docs">Browse docs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/story">Read the story</Link>
        </Button>
      </div>
    </div>
  );
}
