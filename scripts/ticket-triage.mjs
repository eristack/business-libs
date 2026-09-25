#!/usr/bin/env node
/**
 * Maintainer triage for repo-root `tickets/*.md`.
 *
 * Ingest date = first 8 chars of filename (YYYYMMDD), not wall-clock "today"
 * unless you pass --day to match that prefix.
 *
 * Source of truth for ordering: tickets/triage.yaml
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "../packages/ai/ai-ticket-generator/node_modules/yaml/dist/index.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const TICKETS_DIR = path.join(REPO_ROOT, "tickets");
const TRIAGE_PATH = path.join(TICKETS_DIR, "triage.yaml");

function usage() {
  console.error(`Usage:
  node scripts/ticket-triage.mjs list [--day YYYYMMDD]
  node scripts/ticket-triage.mjs stack [--day YYYYMMDD] [--markdown]
  node scripts/ticket-triage.mjs check
`);
  process.exit(1);
}

function listTicketFiles() {
  return fs
    .readdirSync(TICKETS_DIR)
    .filter(
      (f) =>
        f.endsWith(".md") &&
        f !== "README.md" &&
        !f.endsWith("-index-maintainer-priority-stack.md"),
    )
    .sort();
}

function ingestDate(filename) {
  const d = filename.slice(0, 8);
  return /^\d{8}$/.test(d) ? d : "";
}

function isBatchIndex(filename) {
  return filename.includes("-index-") && filename.endsWith(".md");
}

function parseTicketMeta(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const line = (key) => {
    const re = new RegExp(`^- \\*\\*${key}:\\*\\* (.+)$`, "im");
    const m = text.match(re);
    if (!m) return "";
    return m[1].replace(/^`|`$/g, "").trim();
  };
  const title = text.split("\n")[0]?.replace(/^# (Bug|Suggestion): /, "") ?? filePath;
  return {
    title,
    kind: line("kind") || (title.toLowerCase().includes("bug") ? "bug" : "suggestion"),
    package: line("package"),
    feasibility: line("feasibility"),
    reporter: line("reporter"),
    created: line("created"),
  };
}

function loadTriage() {
  if (!fs.existsSync(TRIAGE_PATH)) {
    throw new Error(`Missing ${TRIAGE_PATH}`);
  }
  return parseYaml(fs.readFileSync(TRIAGE_PATH, "utf8"));
}

function collectReferencedFiles(triage) {
  const refs = new Set();
  for (const row of triage.stack ?? []) {
    if (row.file) refs.add(row.file);
  }
  for (const row of triage.backlog ?? []) {
    for (const f of row.files ?? []) refs.add(f);
  }
  for (const batch of triage.batches ?? []) {
    if (batch.index) refs.add(batch.index);
  }
  return refs;
}

function cmdList(day) {
  for (const f of listTicketFiles()) {
    if (day && ingestDate(f) !== day) continue;
    const meta = parseTicketMeta(path.join(TICKETS_DIR, f));
    const tag = isBatchIndex(f) ? "index" : meta.kind;
    console.log(
      [ingestDate(f), tag.padEnd(10), meta.feasibility.padEnd(14), meta.package, f].join(" | "),
    );
  }
}

function cmdStack(day, asMarkdown) {
  const triage = loadTriage();
  const rows = [...(triage.stack ?? [])].sort((a, b) => a.rank - b.rank);
  const filtered = day
    ? rows.filter((r) => ingestDate(r.file) === day)
    : rows;

  if (asMarkdown) {
    console.log(`| Rank | P | File | Package | Notes |`);
    console.log(`| ---: | --- | --- | --- | --- |`);
    for (const r of filtered) {
      const meta = parseTicketMeta(path.join(TICKETS_DIR, r.file));
      console.log(
        `| ${r.rank} | ${r.priority ?? ""} | \`${r.file}\` | ${meta.package} | ${r.notes ?? ""} |`,
      );
    }
    return;
  }

  for (const r of filtered) {
    const meta = parseTicketMeta(path.join(TICKETS_DIR, r.file));
    console.log(
      `${String(r.rank).padStart(3)} ${(r.priority ?? "").padEnd(2)} ${r.file} — ${meta.package} — ${r.notes ?? ""}`,
    );
  }
}

function cmdCheck() {
  const triage = loadTriage();
  const refs = collectReferencedFiles(triage);
  const files = listTicketFiles();
  const errors = [];

  for (const f of files) {
    if (!refs.has(f)) {
      errors.push(`Unlisted ticket: ${f} (add to triage.yaml stack or backlog)`);
    }
  }

  for (const row of triage.stack ?? []) {
    if (!fs.existsSync(path.join(TICKETS_DIR, row.file))) {
      errors.push(`Stack entry missing file: ${row.file}`);
    }
  }

  for (const row of triage.backlog ?? []) {
    for (const f of row.files ?? []) {
      if (!fs.existsSync(path.join(TICKETS_DIR, f))) {
        errors.push(`Backlog entry missing file: ${f}`);
      }
    }
  }

  for (const batch of triage.batches ?? []) {
    if (batch.index && !fs.existsSync(path.join(TICKETS_DIR, batch.index))) {
      errors.push(`Batch index missing: ${batch.index}`);
    }
  }

  const asOf = triage.as_of?.replace(/-/g, "");
  if (asOf) {
    const todayBatch = files.filter((f) => ingestDate(f) === asOf && !isBatchIndex(f));
    const inStackToday = new Set(
      (triage.stack ?? []).filter((r) => ingestDate(r.file) === asOf).map((r) => r.file),
    );
    for (const f of todayBatch) {
      const inBacklog = (triage.backlog ?? []).some((b) => (b.files ?? []).includes(f));
      if (!inStackToday.has(f) && !inBacklog) {
        errors.push(`as_of ${triage.as_of}: ticket not in stack or backlog: ${f}`);
      }
    }
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, tickets: files.length, stack: triage.stack?.length ?? 0 }, null, 2));
}

const args = process.argv.slice(2);
const cmd = args[0];
const day = args.includes("--day") ? args[args.indexOf("--day") + 1] : undefined;
const asMarkdown = args.includes("--markdown");

if (!cmd || cmd === "--help") usage();

switch (cmd) {
  case "list":
    cmdList(day);
    break;
  case "stack":
    cmdStack(day, asMarkdown);
    break;
  case "check":
    cmdCheck();
    break;
  default:
    usage();
}
