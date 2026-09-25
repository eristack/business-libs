import {
  organizationsUsing,
  technologyStack,
  userFeedback,
} from "@/lib/ecosystem-content";

export function HomeEcosystem() {
  return (
    <>
      <section
        id="feedback"
        className="border-y border-border bg-surface py-16 sm:py-20"
      >
        <div className="container-page">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            What teams say
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Field feedback from integrators — we add named references when teams
            approve public quotes.
          </p>
          <ul className="mt-10 grid gap-4 lg:grid-cols-3">
            {userFeedback.map((item) => (
              <li key={item.quote.slice(0, 48)} className="card">
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
        </div>
      </section>

      <section id="adopters" className="container-page py-16 sm:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Organizations using @eristack
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Production and active build-outs — not every consumer is listed yet.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {organizationsUsing.map((org) => (
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
      </section>

      <section
        id="technology"
        className="border-t border-border bg-surface-raised py-16 sm:py-20"
      >
        <div className="container-page">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Technology we use
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Stack defaults for libraries and recommended consumer apps — Drizzle,
            Zod, pnpm, TanStack, and the rest of the spine.
          </p>
          <div className="mt-10 space-y-10">
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
                          <span className="text-[11px] text-muted">
                            {item.note}
                          </span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
