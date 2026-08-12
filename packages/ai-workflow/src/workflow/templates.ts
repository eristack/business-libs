import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

function moduleFilename(): string {
  // CJS build provides __filename; ESM uses import.meta.url
  const cjsFilename = (globalThis as { __filename?: string }).__filename;
  if (typeof cjsFilename === "string" && cjsFilename.length > 0) {
    return cjsFilename;
  }
  try {
    return fileURLToPath(import.meta.url);
  } catch {
    return path.join(process.cwd(), "templates.ts");
  }
}

const require = createRequire(pathToFileURL(moduleFilename()).href);

/** Resolve templates whether running from src (tests) or published dist. */
export function templateDir() {
  const candidates: string[] = [];

  try {
    const pkgJson = require.resolve("@eristack/ai-workflow/package.json");
    candidates.push(path.join(path.dirname(pkgJson), "templates"));
  } catch {
    // ignore
  }

  const here = path.dirname(moduleFilename());
  candidates.push(
    path.resolve(here, "../../templates"),
    path.resolve(here, "../templates"),
  );

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  throw new Error("Could not locate @eristack/ai-workflow templates/");
}

export function readTemplate(
  name: string,
  vars: Record<string, string> = {},
): string {
  let text = fs.readFileSync(path.join(templateDir(), name), "utf8");
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{{${key}}}`, value);
  }
  return text;
}
