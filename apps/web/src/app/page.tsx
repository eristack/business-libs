import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { packages, siteConfig, tenets } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-noise pointer-events-none absolute inset-0" />
        <div className="hero-orbit pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <div className="animate-rise inline-flex items-center gap-2 rounded-md border border-border bg-card/80 px-2.5 py-1 text-[12px] font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="size-1.5 rounded-sm bg-accent" />
              Subsidiary of{" "}
              <a
                href={siteConfig.erista}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground hover:text-accent"
              >
                erista.id
              </a>
            </div>

            <p className="animate-rise-delay-1 mt-6 text-[13px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {siteConfig.name}
            </p>

            <h1 className="animate-rise-delay-1 mt-3 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
              Business primitives
              <span className="mt-1 block text-muted-foreground">
                for TypeScript.
              </span>
            </h1>

            <p className="animate-rise-delay-2 mt-5 max-w-lg text-[15px] leading-7 text-muted-foreground sm:text-base">
              {siteConfig.description} Extracted from the frustration of
              shipping real ERP software without shared domain libraries.
            </p>

            <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-11 px-6 text-sm shadow-sm">
                <Link href="/docs">
                  Read the docs
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 px-6 text-sm"
              >
                <Link href="/story">Why we built this</Link>
              </Button>
            </div>

            <div className="animate-rise-delay-3 mt-10 flex flex-wrap gap-2">
              {packages.map((pkg) => (
                <Link
                  key={pkg.slug}
                  href={pkg.href}
                  className="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[12px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                >
                  {pkg.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="animate-rise-delay-2 relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-zinc-900/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-zinc-900/10">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 font-mono text-[11px] text-zinc-500">
                  money.ts
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-zinc-300 sm:text-[13px]">
                <code>
                  <span className="text-zinc-500">{`// never this`}</span>
                  {"\n"}
                  <span className="text-rose-300">const</span>
                  {" total = "}
                  <span className="text-amber-200">19.99</span>
                  {" + "}
                  <span className="text-amber-200">0.1</span>
                  {"\n\n"}
                  <span className="text-zinc-500">{`// this`}</span>
                  {"\n"}
                  <span className="text-violet-300">import</span>
                  {" { Money } "}
                  <span className="text-violet-300">from</span>
                  {" "}
                  <span className="text-emerald-300">&quot;@eristack/money&quot;</span>
                  {"\n\n"}
                  <span className="text-rose-300">const</span>
                  {" total = Money.of("}
                  <span className="text-emerald-300">&quot;19.99&quot;</span>
                  {", "}
                  <span className="text-emerald-300">&quot;USD&quot;</span>
                  {")\n  .add(Money.of("}
                  <span className="text-emerald-300">&quot;0.10&quot;</span>
                  {", "}
                  <span className="text-emerald-300">&quot;USD&quot;</span>
                  {"))"}
                </code>
              </pre>
              <div className="border-t border-zinc-800 bg-zinc-900/80 px-4 py-3 font-mono text-[11px] text-zinc-400">
                string-first · same-currency arithmetic · ledger-safe
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-zinc-950 text-zinc-100">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "Injected, not absorbed",
              body: "Your DB, host, and storage. Our domain contract.",
            },
            {
              icon: Shield,
              title: "Production-shaped",
              body: "Refresh rotation, scrypt credentials, money and doc numbers that add up.",
            },
            {
              icon: BookOpen,
              title: "Docs beside code",
              body: "Guides live in packages/*/docs — this site just renders them.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-zinc-400">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Packages
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Start with one sharp library
              </h2>
            </div>
            <Link
              href="/packages"
              className="hidden text-[13px] font-semibold text-accent hover:underline sm:inline"
            >
              View all
            </Link>
          </div>

          <ul className="mt-8 divide-y divide-border border-y border-border">
            {packages.map((pkg, index) => (
              <li key={pkg.slug}>
                <Link
                  href={pkg.href}
                  className="group flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4">
                    <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-mono text-[12px] text-muted-foreground">
                        {pkg.name}
                      </p>
                      <p className="mt-1 text-xl font-semibold tracking-tight group-hover:text-accent">
                        {pkg.title}
                      </p>
                      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 self-start rounded-md bg-muted px-3 py-1.5 text-[13px] font-semibold text-foreground transition-colors group-hover:bg-foreground group-hover:text-background sm:self-center">
                    Docs
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Philosophy
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Product tenets we actually ship against
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tenets.slice(0, 3).map((tenet, index) => (
              <div
                key={tenet.title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <p className="font-mono text-[11px] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-sm font-semibold tracking-tight">
                  {tenet.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  {tenet.body}
                </p>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/philosophy">
              Read the full philosophy
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            {
              href: "/story",
              title: "Our story",
              body: "Frustration at Erista, extracted into open libraries.",
            },
            {
              href: "/blog",
              title: "Blog",
              body: "Design notes and opinions on business domain libraries.",
            },
            {
              href: "/support",
              title: "Support & partners",
              body: "Community help, enterprise support, and consultation.",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:border-muted-foreground/40 hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-accent">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {item.body}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground group-hover:text-foreground">
                Explore
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
