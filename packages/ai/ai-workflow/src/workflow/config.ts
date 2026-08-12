import fs from "node:fs";
import path from "node:path";
import type { WorkflowConfig } from "../types.js";
import { configPath, resolveProjectRoot } from "../paths.js";

export const DEFAULT_CONFIG: WorkflowConfig = {
  version: 1,
  roots: ["."],
  ignore: [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/.next/**",
    "**/.eristack/index/**",
    "**/coverage/**",
    "**/*.lock",
    "**/pnpm-lock.yaml",
  ],
  embedModel: "Xenova/all-MiniLM-L6-v2",
  activeSprintId: null,
  maxSearchHits: 8,
  snippetLines: 3,
};

export function readConfig(cwd = process.cwd()): WorkflowConfig | null {
  const file = configPath(cwd);
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as WorkflowConfig;
  return {
    ...DEFAULT_CONFIG,
    ...raw,
    ignore: raw.ignore ?? DEFAULT_CONFIG.ignore,
    roots: raw.roots ?? DEFAULT_CONFIG.roots,
  };
}

export function writeConfig(config: WorkflowConfig, cwd = process.cwd()) {
  const file = configPath(cwd);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function requireConfig(cwd = process.cwd()): WorkflowConfig {
  const config = readConfig(cwd);
  if (!config) {
    throw new Error(
      `Missing ${path.relative(resolveProjectRoot(cwd), configPath(cwd))}. Run: eristack-workflow init`,
    );
  }
  return config;
}
