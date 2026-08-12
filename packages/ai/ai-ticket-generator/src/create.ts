import { randomBytes } from "node:crypto";
import type {
  BugTicket,
  BugTicketInput,
  SuggestionTicket,
  SuggestionTicketInput,
} from "./types.js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function stamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

/** Stable-ish ticket id: timestamp + short random + title slug. */
export function createTicketId(kind: string, title: string): string {
  const rand = randomBytes(3).toString("hex");
  return `${stamp()}-${kind}-${slugify(title) || "ticket"}-${rand}`;
}

export function createBugTicket(input: BugTicketInput): BugTicket {
  const title = input.title.trim();
  if (!title) throw new Error("Bug ticket requires a title");
  if (!input.package.trim()) throw new Error("Bug ticket requires a package");
  if (!input.summary.trim()) throw new Error("Bug ticket requires a summary");

  return {
    id: createTicketId("bug", title),
    kind: "bug",
    package: input.package.trim(),
    title,
    createdAt: new Date().toISOString(),
    reporter: input.reporter,
    body: {
      ...input,
      title,
      package: input.package.trim(),
      summary: input.summary.trim(),
    },
  };
}

export function createSuggestionTicket(
  input: SuggestionTicketInput,
): SuggestionTicket {
  const title = input.title.trim();
  if (!title) throw new Error("Suggestion ticket requires a title");
  if (!input.package.trim()) {
    throw new Error("Suggestion ticket requires a package");
  }
  if (!input.summary.trim()) {
    throw new Error("Suggestion ticket requires a summary");
  }

  return {
    id: createTicketId("suggestion", title),
    kind: "suggestion",
    package: input.package.trim(),
    title,
    createdAt: new Date().toISOString(),
    reporter: input.reporter,
    feasibility: input.feasibility,
    body: {
      ...input,
      title,
      package: input.package.trim(),
      summary: input.summary.trim(),
    },
  };
}
