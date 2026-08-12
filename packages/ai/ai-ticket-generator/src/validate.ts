import type { Ticket } from "./types.js";

export type TicketValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

/** Lightweight completeness checks so empty shells are not “done”. */
export function validateTicket(ticket: Ticket): TicketValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ticket.package.startsWith("@eristack/")) {
    errors.push(`package must be @eristack/* (got ${ticket.package})`);
  }
  if (!ticket.title.trim()) errors.push("title is required");
  if (!ticket.id.trim()) errors.push("id is required");

  if (ticket.kind === "bug") {
    const b = ticket.body;
    if (!b.summary.trim()) errors.push("summary is required");
    if (!b.stepsToReproduce?.length) {
      warnings.push("stepsToReproduce is empty — hard for maintainers to act");
    }
    if (!b.expected?.trim()) warnings.push("expected behavior missing");
    if (!b.actual?.trim()) warnings.push("actual behavior missing");
    if (!b.fixPlan?.length) {
      warnings.push("fixPlan empty — agent handoff will be weaker");
    }
    if (!b.logs?.trim() && !b.scenario?.trim()) {
      warnings.push("no logs or scenario attached");
    }
  } else {
    const b = ticket.body;
    if (!b.summary.trim()) errors.push("summary is required");
    if (!ticket.feasibility && !b.feasibility) {
      warnings.push("feasibility not set — run assessFeasibility");
    }
    if (
      (ticket.feasibility === "possible" ||
        ticket.feasibility === "partial" ||
        b.feasibility === "possible" ||
        b.feasibility === "partial") &&
      !b.implementationSketch?.length
    ) {
      warnings.push(
        "feasible suggestions should include an implementationSketch",
      );
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
