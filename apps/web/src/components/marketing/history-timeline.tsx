import { historyMilestones } from "@/lib/marketing-content";

export function HistoryTimeline() {
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-20">
      <div className="container-page">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          History
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          We started with correctness in ledgers and document flows, then added
          agent discoverability — not the other way around.
        </p>
        <ol className="relative mt-12 space-y-10 border-l border-border pl-8">
          {historyMilestones.map((m) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[calc(2rem+5px)] top-1.5 size-2.5 rounded-full bg-secondary ring-4 ring-surface" />
              <p className="font-mono text-sm font-medium text-secondary">
                {m.year}
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {m.title}
              </p>
              <p className="mt-2 max-w-2xl text-sm text-muted">{m.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
