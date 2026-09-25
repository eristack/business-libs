/**
 * Drop Next dev lock + pid metadata so a stale `next dev` doesn’t block restarts.
 * Does not kill processes — run `lsof -i :3000` / kill the PID if the port is still taken.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(appRoot, ".next");
const devDir = path.join(nextDir, "dev");

if (fs.existsSync(devDir)) {
  for (const name of fs.readdirSync(devDir)) {
    if (name === "lock" || name.endsWith(".pid")) {
      fs.rmSync(path.join(devDir, name), { force: true });
      console.log(`Removed .next/dev/${name}`);
    }
  }
}

const cacheDir = path.join(nextDir, "cache");
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log("Removed .next/cache (clears corrupted Turbopack state)");
}

if (!fs.existsSync(devDir) && !fs.existsSync(cacheDir)) {
  console.log("Nothing to clean.");
}
