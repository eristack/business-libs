import { strengths, tradeoffs } from "@/lib/marketing-content";

export function ProsCons() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-neutral">
          What you get — and what we do not pretend
        </h2>
        <p className="mt-3 text-muted">
          Honest positioning beats buzzwords. Eristack is strong where domain
          rules must match across UI and API; it is not a turnkey ERP.
        </p>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card border-primary/20">
          <h3 className="text-lg font-semibold text-primary">Strengths</h3>
          <ul className="mt-4 space-y-4">
            {strengths.map((item) => (
              <li key={item.title}>
                <p className="font-medium text-neutral">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-tertiary">Tradeoffs</h3>
          <ul className="mt-4 space-y-4">
            {tradeoffs.map((item) => (
              <li key={item.title}>
                <p className="font-medium text-neutral">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
