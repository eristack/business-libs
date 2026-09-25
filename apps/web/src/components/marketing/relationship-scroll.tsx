"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  organizationsSupporting,
  organizationsUsing,
  technologyStack,
  userFeedback,
} from "@/lib/relationship-content";
import { cn } from "@/lib/cn";

const sections = [
  { id: "feedback", label: "Feedback" },
  { id: "using", label: "Teams using us" },
  { id: "supporting", label: "Supporting us" },
  { id: "technology", label: "Technology" },
] as const;

export function RelationshipScroll() {
  const [active, setActive] = useState<string>(sections[0].id);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-18% 0px -55% 0px", threshold: [0.2, 0.5, 0.8] },
    );

    for (const s of sections) {
      const el = sectionRefs.current.get(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="container-page grid gap-10 py-16 lg:grid-cols-[200px_1fr] lg:gap-14">
      <nav className="lg:sticky lg:top-20 lg:self-start" aria-label="Relationship">
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "block shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active === s.id
                    ? "bg-tertiary/15 text-tertiary"
                    : "text-muted hover:text-foreground",
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/support-us"
          className="mt-6 hidden text-sm font-medium text-primary hover:underline lg:inline-block"
        >
          Support us →
        </Link>
      </nav>

      <div className="space-y-20">
        <section
          id="feedback"
          ref={(node) => {
            if (node) sectionRefs.current.set("feedback", node);
          }}
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-foreground">User feedback</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Paraphrased notes from integrators and early adopters — we add named
            references when teams approve public quotes.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {userFeedback.map((item) => (
              <li key={item.quote.slice(0, 40)} className="card">
                <p className="text-sm leading-relaxed text-foreground/90">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="mt-4 text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted">
                  {item.role}
                  {item.organization ? ` · ${item.organization}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="using"
          ref={(node) => {
            if (node) sectionRefs.current.set("using", node);
          }}
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            Organizations using our products
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            @eristack packages in production or active build-out — not every
            consumer is listed yet.
          </p>
          <OrgList entries={organizationsUsing} />
        </section>

        <section
          id="supporting"
          ref={(node) => {
            if (node) sectionRefs.current.set("supporting", node);
          }}
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            Organizations supporting us
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Stewardship, contributions, and partners that keep the libraries
            maintained and documented.
          </p>
          <OrgList entries={organizationsSupporting} />
          <div className="card mt-8 border-primary/30">
            <p className="font-medium text-foreground">Want to support Eristack?</p>
            <p className="mt-2 text-sm text-muted">
              Sponsorship, contribution, and partner paths — separate from paid
              enterprise support.
            </p>
            <Link href="/support-us" className="btn btn-primary mt-4 inline-flex text-sm">
              Support us
            </Link>
          </div>
        </section>

        <section
          id="technology"
          ref={(node) => {
            if (node) sectionRefs.current.set("technology", node);
          }}
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            Technology we use
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Stack defaults for Eristack libraries and recommended consumer apps —
            not an exhaustive lock-in list.
          </p>
          <div className="mt-8 space-y-10">
            {technologyStack.map((group) => (
              <div key={group.label}>
                <h3 className="text-lg font-semibold text-secondary">
                  {group.label}
                </h3>
                <p className="mt-1 text-sm text-muted">{group.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-col rounded-xl border border-border bg-surface px-3 py-2 transition-colors hover:border-secondary/40"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.name}
                        </span>
                        {item.note ? (
                          <span className="text-[11px] text-muted">{item.note}</span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function OrgList({ entries }: { entries: typeof organizationsUsing }) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {entries.map((org) => (
        <li key={org.name} className="card">
          <p className="font-semibold text-foreground">
            {org.href ? (
              <a
                href={org.href}
                className="hover:text-primary"
                target="_blank"
                rel="noreferrer"
              >
                {org.name}
              </a>
            ) : (
              org.name
            )}
          </p>
          <p className="mt-2 text-sm text-muted">{org.description}</p>
        </li>
      ))}
    </ul>
  );
}
