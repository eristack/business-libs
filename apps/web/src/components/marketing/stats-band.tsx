import {
  communityStats,
  packageStats,
} from "@/lib/marketing";

export function StatsBand() {
  const stats = packageStats();

  const items = [
    {
      value: String(stats.total),
      label: "Published packages",
      hint: "Monorepo @eristack/*",
    },
    {
      value: String(stats.withChangelog),
      label: "With changelogs",
      hint: "Semver + Changesets",
    },
    {
      value: communityStats.firstReleaseYear,
      label: "Shipping since",
      hint: "Primitives → ERP spine",
    },
    {
      value: communityStats.githubStarsLabel,
      label: "Community",
      hint: communityStats.npmWeeklyDownloadsNote,
    },
  ] as const;

  return (
    <section className="border-b border-border bg-neutral py-12">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="font-mono text-3xl font-semibold text-primary">
              {item.value}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{item.label}</p>
            <p className="mt-1 text-xs text-muted">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
