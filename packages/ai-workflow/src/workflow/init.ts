import fs from "node:fs";
import path from "node:path";
import {
  BACKLOG_FILE,
  INDEX_DIR,
  SPRINTS_DIR,
  WORKFLOW_DIR,
  resolveProjectRoot,
} from "../paths.js";
import { DEFAULT_CONFIG, readConfig, writeConfig } from "./config.js";
import { readTemplate } from "./templates.js";

export type InitResult = {
  created: string[];
  already: string[];
  root: string;
};

export function initWorkflow(cwd = process.cwd()): InitResult {
  const root = resolveProjectRoot(cwd);
  const created: string[] = [];
  const already: string[] = [];

  const dirs = [
    path.join(root, WORKFLOW_DIR),
    path.join(root, path.dirname(BACKLOG_FILE)),
    path.join(root, SPRINTS_DIR),
    path.join(root, INDEX_DIR),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      created.push(path.relative(root, dir));
    } else {
      already.push(path.relative(root, dir));
    }
  }

  if (!readConfig(cwd)) {
    writeConfig(DEFAULT_CONFIG, cwd);
    created.push(path.relative(root, path.join(root, WORKFLOW_DIR, "config.json")));
  } else {
    already.push(".eristack/workflow/config.json");
  }

  const backlog = path.join(root, BACKLOG_FILE);
  if (!fs.existsSync(backlog)) {
    fs.writeFileSync(backlog, readTemplate("backlog.yaml"), "utf8");
    created.push(path.relative(root, backlog));
  } else {
    already.push(path.relative(root, backlog));
  }

  const gitignore = path.join(root, ".gitignore");
  const ignoreLine = ".eristack/index/";
  if (fs.existsSync(gitignore)) {
    const text = fs.readFileSync(gitignore, "utf8");
    if (!text.includes(ignoreLine)) {
      fs.appendFileSync(
        gitignore,
        `${text.endsWith("\n") ? "" : "\n"}\n# @eristack/ai-workflow local index\n${ignoreLine}\n`,
        "utf8",
      );
      created.push(".gitignore (+ index ignore)");
    }
  }

  return { created, already, root };
}
