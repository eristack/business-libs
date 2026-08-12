import fs from "node:fs";
import path from "node:path";
import type { Ticket } from "./types.js";
import { renderTicketMarkdown, ticketFilename } from "./render.js";

export const DEFAULT_TICKETS_DIR = path.join(".eristack", "tickets");

export function resolveTicketsDir(cwd: string, override?: string): string {
  return path.resolve(cwd, override ?? DEFAULT_TICKETS_DIR);
}

/** Write a portable ticket markdown file; returns absolute path. */
export function writeTicketFile(
  cwd: string,
  ticket: Ticket,
  options?: { ticketsDir?: string },
): string {
  const dir = resolveTicketsDir(cwd, options?.ticketsDir);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, ticketFilename(ticket));
  fs.writeFileSync(filePath, `${renderTicketMarkdown(ticket).trimEnd()}\n`, "utf8");
  return filePath;
}
