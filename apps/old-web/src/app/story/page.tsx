import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Story",
  description: "Why Eristack exists — born from frustration shipping product at Erista.",
};

export default function StoryPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Story"
        title="Born from frustration at Erista"
        description="Eristack is a subsidiary effort of erista.id — extracted from the pain of building real business software on TypeScript."
      />

      <div className="prose-docs mt-12">
        <p>
          At{" "}
          <a href={siteConfig.erista} target="_blank" rel="noreferrer">
            Erista
          </a>
          , we ship product that actually cares about money, identity, and
          operational correctness. Again and again we hit the same wall: the Node
          ecosystem treats those as “just use a number” or “roll your own JWT
          middleware,” while Java and C# teams have shared libraries for this
          stuff.
        </p>
        <p>
          The frustration was specific. Floating-point amounts sneaking into
          invoices. Refresh tokens stored in plaintext “for the demo.” Auth
          packages that invent a second <code>users</code> table and fight the
          one you already have. Every new service meant copying half-finished
          internals — and quietly inheriting the bugs.
        </p>
        <p>
          We got tired of rewriting the boring, high-stakes parts between
          products. So we extracted the pieces we trust into{" "}
          <strong>Eristack</strong>: small libraries with sharp contracts,
          published so Erista — and anyone else — doesn’t have to keep paying
          that tax.
        </p>
        <h2>What “stack” means here</h2>
        <p>
          Not a battery-included application framework. A shelf of libraries you
          can pull onto <em>your</em> stack: Express or Nest, Drizzle or
          something else, React or none at all.
        </p>
        <p>
          The rule we won’t break:{" "}
          <strong>inject infrastructure, don’t absorb it</strong>. Your app owns
          the database connection, the users table, the API host, and the token
          storage. We own the domain contract.
        </p>
        <h2>Subsidiary of erista.id</h2>
        <p>
          Eristack exists because Erista needed it. The packages are open; the
          product pressure that keeps them honest still comes from shipping
          business software every day.
        </p>
        <h2>Where we’re going</h2>
        <p>
          Keep publishing the enterprise libraries we actually use. Keep docs
          next to the code. Offer support when production stakes are high. Stay
          small enough that each package remains understandable in an afternoon.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/philosophy">Product philosophy</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/maintainers">Maintainers</Link>
        </Button>
        <Button asChild variant="outline">
          <a href={siteConfig.erista} target="_blank" rel="noreferrer">
            erista.id
          </a>
        </Button>
      </div>
    </div>
  );
}
