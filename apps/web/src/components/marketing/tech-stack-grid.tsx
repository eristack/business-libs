import { technologyStack } from "@/lib/ecosystem-content";
import type { BrandLogoKey } from "@/lib/brand-logos";
import { BrandLogoTile } from "@/components/brand-logo";

/** Maps stack item display names to simple-icons keys */
const itemLogoKey: Record<string, BrandLogoKey> = {
  TypeScript: "typescript",
  pnpm: "pnpm",
  Turborepo: "turborepo",
  Vitest: "vitest",
  Changesets: "changesets",
  "Drizzle ORM": "drizzle",
  PostgreSQL: "postgresql",
  "Zod 4": "zod",
  Express: "express",
  NestJS: "nestjs",
  "OpenAPI 3.1": "openapi",
  React: "react",
  "TanStack Query": "tanstack-query",
  "TanStack Router": "tanstack-router",
  "TanStack Form": "tanstack-form",
  "TanStack Intent": "tanstack-intent",
  "Next.js": "nextjs",
  "Tailwind CSS": "tailwind",
};

export function TechStackGrid() {
  return (
    <section
      id="technology"
      className="border-t border-border bg-surface-raised py-16 sm:py-20"
    >
      <div className="container-page">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Technology we use
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Stack defaults for libraries and recommended consumer apps — built on
          the tools teams already trust.
        </p>

        <div className="mt-12 space-y-14">
          {technologyStack.map((group) => (
            <div key={group.label}>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
                <h3 className="text-lg font-semibold text-secondary">
                  {group.label}
                </h3>
                <p className="max-w-md text-sm text-muted">{group.description}</p>
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {group.items.map((item) => {
                  const logoKey = itemLogoKey[item.name];
                  if (!logoKey) {
                    return (
                      <li
                        key={item.name}
                        className="rounded-2xl border border-border bg-surface p-4 text-sm text-foreground"
                      >
                        {item.name}
                      </li>
                    );
                  }
                  return (
                    <li key={item.name}>
                      <BrandLogoTile
                        icon={logoKey}
                        label={item.name}
                        note={item.note}
                        href={item.href}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
