import path from "node:path";

export const ERISTACK_DIR = ".eristack";
export const WORKFLOW_DIR = path.join(ERISTACK_DIR, "workflow");
export const INDEX_DIR = path.join(ERISTACK_DIR, "index");
export const INDEX_DB = path.join(INDEX_DIR, "workflow.sqlite");
export const CONFIG_FILE = path.join(WORKFLOW_DIR, "config.json");
export const BACKLOG_FILE = path.join(WORKFLOW_DIR, "backlog", "items.yaml");
export const SPRINTS_DIR = path.join(WORKFLOW_DIR, "sprints");

export function resolveProjectRoot(cwd = process.cwd()) {
  return path.resolve(cwd);
}

export function workflowRoot(cwd = process.cwd()) {
  return path.join(resolveProjectRoot(cwd), WORKFLOW_DIR);
}

export function indexDbPath(cwd = process.cwd()) {
  return path.join(resolveProjectRoot(cwd), INDEX_DB);
}

export function configPath(cwd = process.cwd()) {
  return path.join(resolveProjectRoot(cwd), CONFIG_FILE);
}

export function backlogPath(cwd = process.cwd()) {
  return path.join(resolveProjectRoot(cwd), BACKLOG_FILE);
}

export function sprintsPath(cwd = process.cwd()) {
  return path.join(resolveProjectRoot(cwd), SPRINTS_DIR);
}
