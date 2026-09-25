#!/usr/bin/env node
/**
 * Diff Backseat `routesSnapshot()` JSON files (Horizon A vs Express mirror).
 *
 *   node scripts/backseat-routes-check.mjs check baseline.json candidate.json
 *   node scripts/backseat-routes-check.mjs diff baseline.json candidate.json
 */
import fs from "node:fs";
import {
  diffRoutesSnapshots,
  parseRoutesSnapshotJson,
} from "../packages/infrastructure/backseat/dist/testing/index.js";

function usage() {
  console.error(`Usage:
  node scripts/backseat-routes-check.mjs check <baseline.json> <candidate.json>
  node scripts/backseat-routes-check.mjs diff <baseline.json> <candidate.json>
`);
  process.exit(1);
}

const [cmd, baselinePath, candidatePath] = process.argv.slice(2);
if (!cmd || !baselinePath || !candidatePath) {
  usage();
}

const baseline = parseRoutesSnapshotJson(fs.readFileSync(baselinePath, "utf8"));
const candidate = parseRoutesSnapshotJson(fs.readFileSync(candidatePath, "utf8"));
const diffs = diffRoutesSnapshots(baseline, candidate);

if (cmd === "diff") {
  console.log(JSON.stringify(diffs, null, 2));
  process.exit(0);
}

if (cmd === "check") {
  if (diffs.length === 0) {
    console.log(JSON.stringify({ ok: true, diffs: 0 }, null, 2));
    process.exit(0);
  }
  console.error(JSON.stringify({ ok: false, diffs }, null, 2));
  process.exit(1);
}

usage();
