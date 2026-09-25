#!/usr/bin/env node
/**
 * Template: dual-target API mirror smoke (copy into your app as scripts/express-api-mirror.mjs).
 *
 * 1. Export Backseat routesSnapshot() to baseline.json (workshop boot).
 * 2. Export Express routesSnapshot equivalent to candidate.json.
 * 3. pnpm backseat:routes:check baseline.json candidate.json
 * 4. Optional: login + GET list routes + assertDataGridEnvelope on JSON body.
 */
import {
  assertDataGridEnvelope,
  assertRoutesSnapshotsEqual,
  isSafeMirrorGetRoute,
  parseRoutesSnapshotJson,
} from "@eristack/backseat/testing";
import fs from "node:fs";

// --- app wiring (replace) ---
const BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:3000";
const baseline = parseRoutesSnapshotJson(
  fs.readFileSync(new URL("./routes-baseline.json", import.meta.url), "utf8"),
);
const candidate = parseRoutesSnapshotJson(
  fs.readFileSync(new URL("./routes-candidate.json", import.meta.url), "utf8"),
);

assertRoutesSnapshotsEqual(baseline, candidate, "Backseat vs Express routes");

const token = process.env.API_MIRROR_TOKEN; // set after jwt-auth login in your script

for (const route of candidate.routes) {
  if (!isSafeMirrorGetRoute(route.method)) continue;
  const res = await fetch(`${BASE_URL}${route.fullPath}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 404) {
    throw new Error(`Mirror smoke 404: ${route.method} ${route.fullPath}`);
  }
  if (res.ok && route.fullPath.includes("register")) {
    const body = await res.json();
    assertDataGridEnvelope(body);
  }
}

console.log("api-mirror smoke OK");
