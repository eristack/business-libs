import { supportTiers } from "@/lib/site";
import { cn } from "@/lib/cn";

type SupportTiersProps = {
  /** Highlight the paid tiers on marketing pages */
  emphasize?: "enterprise" | "consultation" | null;
  className?: string;
};

export function SupportTiers({
  emphasize = null,
  className,
}: SupportTiersProps) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      {supportTiers.map((tier) => {
        const isEnterprise = tier.name === "Enterprise support";
        const isConsult = tier.name === "Consultation";
        const highlighted =
          (emphasize === "enterprise" && isEnterprise) ||
          (emphasize === "consultation" && isConsult);

        return (
          <article
            key={tier.name}
            className={cn(
              "card flex flex-col",
              highlighted &&
                "border-secondary/40 ring-1 ring-secondary/20",
              isEnterprise &&
                emphasize === null &&
                "border-primary/35",
            )}
          >
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {tier.name}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-foreground">
              {tier.price}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {tier.description}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-foreground/85">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <TierCta tier={tier} highlighted={highlighted} />
          </article>
        );
      })}
    </div>
  );
}

function TierCta({
  tier,
  highlighted,
}: {
  tier: (typeof supportTiers)[number];
  highlighted: boolean;
}) {
  const className = cn(
    "btn mt-8 w-full text-center",
    highlighted || tier.name === "Enterprise support"
      ? "btn-primary"
      : "btn-outline",
  );

  if (tier.cta.href.startsWith("mailto:")) {
    return (
      <a href={tier.cta.href} className={className}>
        {tier.cta.label}
      </a>
    );
  }

  return (
    <a
      href={tier.cta.href}
      className={className}
      target="_blank"
      rel="noreferrer"
    >
      {tier.cta.label}
    </a>
  );
}
