import { organizationsUsing, userFeedback } from "@/lib/ecosystem-content";
import { TechStackGrid } from "@/components/marketing/tech-stack-grid";

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

      <TechStackGrid />
    </>
  );
}
