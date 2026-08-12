import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of ["cli.js", "mcp.js"]) {
  const file = path.join(root, "dist", name);
  if (fs.existsSync(file)) fs.chmodSync(file, 0o755);
}
