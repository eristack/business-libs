import { listBacklog, upsertBacklogItem } from "./workflow/backlog.js";
import { requireConfig, writeConfig } from "./workflow/config.js";
import { initWorkflow } from "./workflow/init.js";
import {
  createAdr,
  createSprint,
  getSprint,
  listSprints,
  listTasks,
  summarizeSprint,
  upsertTask,
} from "./workflow/sprint.js";
import { indexStats, reindexProject } from "./index/reindex.js";
import { readChunk, searchProject } from "./index/search.js";

export function createWorkflowClient(cwd = process.cwd()) {
  return {
    cwd,
    init: () => initWorkflow(cwd),
    status: () => {
      const config = requireConfig(cwd);
      return {
        activeSprintId: config.activeSprintId,
        embedModel: config.embedModel,
        index: indexStats(cwd),
        sprints: listSprints(cwd).slice(0, 10).map((s) => ({
          id: s.id,
          title: s.title,
        })),
      };
    },
    reindex: (options?: { embed?: boolean }) => reindexProject(cwd, options),
    search: (query: string, limit?: number) =>
      searchProject(query, cwd, { limit }),
    readChunk: (
      path: string,
      opts?: { startLine?: number; endLine?: number; maxLines?: number },
    ) => readChunk(path, cwd, opts),
    backlog: {
      list: () => listBacklog(cwd),
      upsert: (item: Parameters<typeof upsertBacklogItem>[0]) =>
        upsertBacklogItem(item, cwd),
    },
    sprint: {
      list: () => listSprints(cwd),
      create: (title: string, activate = true) =>
        createSprint(title, cwd, { activate }),
      get: (id: string) => getSprint(id, cwd),
      setActive: (id: string) => {
        const config = requireConfig(cwd);
        getSprint(id, cwd);
        config.activeSprintId = id;
        writeConfig(config, cwd);
        return { activeSprintId: id };
      },
      tasks: {
        list: (sprintId: string) => listTasks(sprintId, cwd),
        upsert: (
          sprintId: string,
          task: Parameters<typeof upsertTask>[1],
        ) => upsertTask(sprintId, task, cwd),
      },
      adr: {
        create: (sprintId: string, title: string) =>
          createAdr(sprintId, title, cwd),
      },
      summarize: (sprintId: string) => summarizeSprint(sprintId, cwd),
    },
  };
}

export type WorkflowClient = ReturnType<typeof createWorkflowClient>;
