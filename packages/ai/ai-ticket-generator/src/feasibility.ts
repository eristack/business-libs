import type {
  Feasibility,
  FeasibilityResult,
  SuggestionTicketInput,
  TicketSubscription,
} from "./types.js";

const OUT_OF_SCOPE_HINTS = [
  "rewrite the whole",
  "replace drizzle",
  "support php",
  "support python",
  "support ruby",
  "multi-tenant saas platform",
  "hosted cloud",
  "gui designer",
];

const CORE_BOUNDARY_HINTS = [
  "import react in core",
  "import express in core",
  "import nest in core",
  "open database connection",
  "create users table",
];

function includesAny(haystack: string, needles: string[]): string | null {
  const lower = haystack.toLowerCase();
  for (const needle of needles) {
    if (lower.includes(needle)) return needle;
  }
  return null;
}

/**
 * Heuristic feasibility gate for suggestion tickets.
 * Agents may refine the rationale; this gives an immediate first pass so
 * maintainers know whether the ask is in-bounds for the subscribed package.
 */
export function assessFeasibility(
  suggestion: Pick<
    SuggestionTicketInput,
    "title" | "summary" | "proposedBehavior" | "proposedApi" | "userStory"
  >,
  subscription?: TicketSubscription | null,
): FeasibilityResult {
  const blob = [
    suggestion.title,
    suggestion.summary,
    suggestion.proposedBehavior ?? "",
    suggestion.proposedApi ?? "",
    suggestion.userStory ?? "",
  ].join("\n");

  const outHit = includesAny(blob, [
    ...OUT_OF_SCOPE_HINTS,
    ...(subscription?.outOfScope
      ? subscription.outOfScope
          .split(/[.\n]/)
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s.length > 12)
          .slice(0, 8)
      : []),
  ]);
  if (outHit) {
    return {
      feasibility: "unlikely",
      rationale: `Ask looks outside package boundaries (matched “${outHit}”). Prefer documenting as a consumer-app concern or a different package.`,
      nextSteps: [
        "Confirm with reporter whether this belongs in app code instead",
        "If still desired, open a needs-decision ticket for maintainers",
      ],
    };
  }

  const boundaryHit = includesAny(blob, CORE_BOUNDARY_HINTS);
  if (boundaryHit) {
    return {
      feasibility: "unlikely",
      rationale: `Violates Eristack core/adapter rules (matched “${boundaryHit}”).`,
      nextSteps: [
        "Redirect to an adapter entry if a framework shell is needed",
        "Keep core free of framework and infrastructure imports",
      ],
    };
  }

  const needsDecision =
    /\b(breaking|major|migrate all|rename public|remove api)\b/i.test(blob);
  if (needsDecision) {
    return {
      feasibility: "needs-decision",
      rationale:
        "Looks like a breaking or public-API change. Maintainer product call required before an agent implements.",
      nextSteps: [
        "Draft migration notes and Alternatives section",
        "Wait for maintainer decision before coding",
      ],
    };
  }

  const partial =
    /\b(optional|adapter|experimental|behind flag|new export)\b/i.test(blob) ||
    Boolean(subscription?.scope && !blob.toLowerCase().includes(
      subscription.package.replace("@eristack/", "").toLowerCase(),
    ));

  const feasibility: Feasibility = partial ? "partial" : "possible";
  const scopeNote = subscription?.scope
    ? ` Package scope: ${subscription.scope.trim().slice(0, 200)}`
    : "";

  return {
    feasibility,
    rationale:
      feasibility === "partial"
        ? `Likely doable as an additive / adapter-scoped change.${scopeNote}`
        : `In-bounds for ${subscription?.package ?? suggestion.title}; proceed with a concrete implementation sketch.${scopeNote}`,
    nextSteps: [
      "Load the package Intent skill before coding",
      "Prefer examples/* patterns for adapter work",
      "Add a Changeset if the public surface changes",
      ...(subscription?.skills?.length
        ? [`Suggested skills: ${subscription.skills.join(", ")}`]
        : []),
    ],
  };
}
