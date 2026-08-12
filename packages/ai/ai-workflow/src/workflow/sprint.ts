import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { SprintMeta, SprintTask } from "../types.js";
import { sprintsPath } from "../paths.js";
import { requireConfig, writeConfig } from "./config.js";
import { readTemplate } from "./templates.js";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function listSprints(cwd = process.cwd()): SprintMeta[] {
  const root = sprintsPath(cwd);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const id = entry.name;
      const dir = path.join(root, id);
      const plan = path.join(dir, "plan.md");
      let title = id;
      if (fs.existsSync(plan)) {
        const first = fs.readFileSync(plan, "utf8").split("\n")[0] ?? "";
        const match = /^#\s*Sprint:\s*(.+)$/i.exec(first.trim());
        if (match?.[1]) title = match[1].trim();
      }
      const createdAt = id.slice(0, 10);
      return {
        id,
        title,
        createdAt,
        path: path.relative(cwd, dir),
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function createSprint(
  title: string,
  cwd = process.cwd(),
  options: { activate?: boolean } = {},
): SprintMeta {
  const date = new Date().toISOString().slice(0, 10);
  const id = `${date}-${slugify(title) || "sprint"}`;
  const dir = path.join(sprintsPath(cwd), id);
  if (fs.existsSync(dir)) {
    throw new Error(`Sprint already exists: ${id}`);
  }
  fs.mkdirSync(path.join(dir, "adr"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "plan.md"),
    readTemplate("plan.md", { title }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(dir, "tasks.yaml"),
    readTemplate("tasks.yaml"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(dir, "summary.md"),
    readTemplate("summary.md", { title }),
    "utf8",
  );

  if (options.activate !== false) {
    const config = requireConfig(cwd);
    config.activeSprintId = id;
    writeConfig(config, cwd);
  }

  return {
    id,
    title,
    createdAt: date,
    path: path.relative(cwd, dir),
  };
}

export function getSprint(id: string, cwd = process.cwd()) {
  const dir = path.join(sprintsPath(cwd), id);
  if (!fs.existsSync(dir)) throw new Error(`Unknown sprint: ${id}`);
  const planPath = path.join(dir, "plan.md");
  const tasksPath = path.join(dir, "tasks.yaml");
  const summaryPath = path.join(dir, "summary.md");
  const adrDir = path.join(dir, "adr");
  const adrs = fs.existsSync(adrDir)
    ? fs
        .readdirSync(adrDir)
        .filter((name) => name.endsWith(".md"))
        .sort()
    : [];
  const tasks = listTasks(id, cwd);
  return {
    id,
    path: path.relative(cwd, dir),
    planPath: path.relative(cwd, planPath),
    tasksPath: path.relative(cwd, tasksPath),
    summaryPath: path.relative(cwd, summaryPath),
    adrCount: adrs.length,
    adrs: adrs.map((name) => path.relative(cwd, path.join(adrDir, name))),
    taskCounts: {
      todo: tasks.filter((t) => t.status === "todo").length,
      doing: tasks.filter((t) => t.status === "doing").length,
      done: tasks.filter((t) => t.status === "done").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
    },
  };
}

type TasksFile = { tasks: SprintTask[] };

function loadTasks(id: string, cwd: string): TasksFile {
  const file = path.join(sprintsPath(cwd), id, "tasks.yaml");
  if (!fs.existsSync(file)) return { tasks: [] };
  const raw = YAML.parse(fs.readFileSync(file, "utf8")) as TasksFile | null;
  return { tasks: raw?.tasks ?? [] };
}

function saveTasks(id: string, data: TasksFile, cwd: string) {
  const file = path.join(sprintsPath(cwd), id, "tasks.yaml");
  fs.writeFileSync(file, YAML.stringify(data), "utf8");
}

export function listTasks(sprintId: string, cwd = process.cwd()): SprintTask[] {
  return loadTasks(sprintId, cwd).tasks;
}

export function upsertTask(
  sprintId: string,
  input: Partial<SprintTask> & { title: string; id?: string },
  cwd = process.cwd(),
): SprintTask {
  getSprint(sprintId, cwd);
  const data = loadTasks(sprintId, cwd);
  const id =
    input.id ??
    `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const existing = data.tasks.findIndex((task) => task.id === id);
  const next: SprintTask = {
    id,
    title: input.title,
    status: input.status ?? "todo",
    depends: input.depends,
    owner: input.owner,
  };
  if (existing >= 0) data.tasks[existing] = { ...data.tasks[existing], ...next };
  else data.tasks.push(next);
  saveTasks(sprintId, data, cwd);
  return next;
}

export function createAdr(
  sprintId: string,
  title: string,
  cwd = process.cwd(),
): { path: string; number: string } {
  const dir = path.join(sprintsPath(cwd), sprintId, "adr");
  fs.mkdirSync(dir, { recursive: true });
  const existing = fs.readdirSync(dir).filter((name) => /^ADR-\d+/i.test(name));
  const number = String(existing.length + 1).padStart(4, "0");
  const slug = slugify(title) || "decision";
  const fileName = `ADR-${number}-${slug}.md`;
  const file = path.join(dir, fileName);
  fs.writeFileSync(
    file,
    readTemplate("adr.md", {
      number,
      title,
      date: new Date().toISOString().slice(0, 10),
    }),
    "utf8",
  );
  return { path: path.relative(cwd, file), number };
}

export function summarizeSprint(sprintId: string, cwd = process.cwd()) {
  const sprint = getSprint(sprintId, cwd);
  const tasks = listTasks(sprintId, cwd);
  const dir = path.join(sprintsPath(cwd), sprintId);
  const plan = fs.readFileSync(path.join(dir, "plan.md"), "utf8");
  const titleMatch = /^#\s*Sprint:\s*(.+)$/im.exec(plan);
  const title = titleMatch?.[1]?.trim() ?? sprintId;

  const shipped = tasks
    .filter((task) => task.status === "done")
    .map((task) => `- ${task.title}`)
    .join("\n");
  const open = tasks
    .filter((task) => task.status !== "done")
    .map((task) => `- [${task.status}] ${task.title}`)
    .join("\n");
  const adrs = sprint.adrs.map((p) => `- ${path.basename(p)}`).join("\n");

  const body = `# Sprint summary: ${title}

## Outcome

<!-- shipped / partial / abandoned -->

## What shipped

${shipped || "-"}

## Follow-ups

${open || "-"}

## ADRs

${adrs || "-"}
`;

  const summaryPath = path.join(dir, "summary.md");
  fs.writeFileSync(summaryPath, body, "utf8");
  return {
    path: path.relative(cwd, summaryPath),
    outline: {
      title,
      done: tasks.filter((t) => t.status === "done").length,
      open: tasks.filter((t) => t.status !== "done").length,
      adrs: sprint.adrCount,
    },
  };
}
