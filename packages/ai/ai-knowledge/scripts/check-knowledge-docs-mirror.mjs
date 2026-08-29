#!/usr/bin/env node
/**
 * Ensure ai-knowledge canonical guides match site mirror docs (body only).
 * knowledge/*.md is source of truth; docs/*.md adds frontmatter for the site.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const knowledgeDir = path.join(pkgRoot, "knowledge");
const docsDir = path.join(pkgRoot, "docs");

/** ERP spine guides — must stay mirrored for agent + site parity. */
const REQUIRED_MIRRORS = [
  "document-lines-erp.md",
  "backseat-then-backend.md",
  "optimistic-document-version.md",
  "http-errors.md",
];

function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\r?\n?/, "");
}

function normalize(text) {
  return stripFrontmatter(text).replace(/\r\n/g, "\n").trim();
}

function main() {
  const failures = [];

  for (const name of REQUIRED_MIRRORS) {
    const knowledgePath = path.join(knowledgeDir, name);
    const docsPath = path.join(docsDir, name);

    if (!fs.existsSync(knowledgePath)) {
      failures.push(`missing knowledge/${name}`);
      continue;
    }
    if (!fs.existsSync(docsPath)) {
      failures.push(`missing docs/${name} mirror for knowledge/${name}`);
      continue;
    }

    const knowledgeBody = normalize(fs.readFileSync(knowledgePath, "utf8"));
    const docsBody = normalize(fs.readFileSync(docsPath, "utf8"));

    if (knowledgeBody !== docsBody) {
      failures.push(`${name}: knowledge/ and docs/ bodies differ — copy knowledge → docs`);
    }
  }

  if (failures.length > 0) {
    console.error("knowledge-docs mirror check failed:\n");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    console.error("\nFix: edit knowledge/*.md then mirror body to docs/*.md (keep docs frontmatter).");
    process.exit(1);
  }

  console.log(`OK — ${REQUIRED_MIRRORS.length} canonical guides mirrored in docs/`);
}

main();
