import type {
  BugTicket,
  SuggestionTicket,
  Ticket,
  TicketKind,
} from "./types.js";

function fence(lang: string, body: string): string {
  return `\`\`\`${lang}\n${body.replace(/\n$/, "")}\n\`\`\``;
}

function bullets(items: string[] | undefined, empty = "_None yet._"): string {
  if (!items?.length) return empty;
  return items.map((item) => `- ${item}`).join("\n");
}

function section(title: string, body: string | undefined): string {
  if (!body?.trim()) return `## ${title}\n\n_None yet._\n`;
  return `## ${title}\n\n${body.trim()}\n`;
}

function renderBug(ticket: BugTicket): string {
  const b = ticket.body;
  const envLines = b.environment
    ? Object.entries({
        runtime: b.environment.runtime,
        os: b.environment.os,
        framework: b.environment.framework,
        ...b.environment.extra,
      })
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => `- **${k}:** ${v}`)
        .join("\n")
    : "";

  return [
    `# Bug: ${ticket.title}`,
    "",
    `> Portable Eristack ticket — send this file to the maintainer. An agent can open it and start fixing.`,
    "",
    "## Meta",
    "",
    `- **id:** \`${ticket.id}\``,
    `- **kind:** bug`,
    `- **package:** \`${ticket.package}\``,
    b.version ? `- **observed version:** \`${b.version}\`` : null,
    `- **created:** ${ticket.createdAt}`,
    ticket.reporter ? `- **reporter:** ${ticket.reporter}` : null,
    "",
    section("Summary", b.summary),
    section("Scenario", b.scenario),
    "## Steps to reproduce",
    "",
    bullets(b.stepsToReproduce),
    "",
    section("Expected", b.expected),
    section("Actual", b.actual),
    section("Impact", b.impact),
    "## Environment",
    "",
    envLines || "_Not provided._",
    "",
    "## Logs",
    "",
    b.logs?.trim() ? fence("text", b.logs.trim()) : "_None attached._",
    "",
    "## Suspects",
    "",
    bullets(b.suspects),
    "",
    "## Fix plan",
    "",
    bullets(b.fixPlan, "_Maintainer / agent should draft after triage._"),
    "",
    "## Agent handoff",
    "",
    "1. Load the package Intent skill(s) for `" + ticket.package + "`.",
    "2. Reproduce from **Steps to reproduce** (or confirm cannot).",
    "3. Implement along **Fix plan**; keep scope to this package.",
    "4. Add/adjust tests; run package `test` + `typecheck`.",
    "5. If public API changes, add a Changeset.",
    "",
    section("Notes", b.notes),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function renderSuggestion(ticket: SuggestionTicket): string {
  const b = ticket.body;
  const feasibility = ticket.feasibility ?? b.feasibility ?? "needs-decision";

  return [
    `# Suggestion: ${ticket.title}`,
    "",
    `> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.`,
    "",
    "## Meta",
    "",
    `- **id:** \`${ticket.id}\``,
    `- **kind:** suggestion`,
    `- **package:** \`${ticket.package}\``,
    `- **feasibility:** \`${feasibility}\``,
    `- **created:** ${ticket.createdAt}`,
    ticket.reporter ? `- **reporter:** ${ticket.reporter}` : null,
    "",
    section("Summary", b.summary),
    section("User story", b.userStory),
    section("Proposed behavior", b.proposedBehavior),
    section("Proposed API", b.proposedApi),
    section("Feasibility rationale", b.feasibilityRationale),
    "## Implementation sketch",
    "",
    bullets(
      b.implementationSketch,
      "_Fill after feasibility is possible or partial._",
    ),
    "",
    "## Risks",
    "",
    bullets(b.risks),
    "",
    "## Alternatives",
    "",
    bullets(b.alternatives),
    "",
    "## Agent handoff",
    "",
    feasibility === "unlikely"
      ? "Do **not** implement. Explain out-of-scope to the reporter or redirect packages."
      : feasibility === "needs-decision"
        ? "Do **not** implement until a maintainer confirms the public/API decision."
        : [
            "1. Load Intent skills for `" + ticket.package + "`.",
            "2. Implement the sketch; prefer additive APIs.",
            "3. Update package docs + skills if the public surface changes.",
            "4. Run `pnpm knowledge:sync` when skills/exports change.",
            "5. Add a Changeset for user-facing changes.",
          ].join("\n"),
    "",
    section("Notes", b.notes),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Render a ticket as a single markdown file suitable for email / chat attach. */
export function renderTicketMarkdown(ticket: Ticket): string {
  return ticket.kind === "bug" ? renderBug(ticket) : renderSuggestion(ticket);
}

export function ticketFilename(ticket: Ticket): string {
  return `${ticket.id}.md`;
}

export function isTicketKind(value: string): value is TicketKind {
  return value === "bug" || value === "suggestion";
}
