import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import { createWorkflowClient } from "../client.js";
import { formatSearchHits, formatToolText } from "../format/compact.js";
import { initWorkflow } from "../workflow/init.js";

function cwdFromEnv() {
  return process.env.ERISTACK_WORKFLOW_CWD || process.cwd();
}

function activeSprintId(client: ReturnType<typeof createWorkflowClient>) {
  try {
    return client.status().activeSprintId;
  } catch {
    return null;
  }
}

export function createWorkflowMcpServer(cwd = cwdFromEnv()) {
  const server = new McpServer(
    { name: "eristack-workflow", version: "0.1.0" },
    { capabilities: { tools: {}, resources: {} } },
  );
  const client = createWorkflowClient(cwd);

  server.registerTool(
    "workflow_status",
    {
      description:
        "Compact project workflow status: active sprint, index stats. Low token.",
      inputSchema: {},
    },
    async () => {
      try {
        return formatToolText(client.status());
      } catch (error) {
        return formatToolText({
          error: error instanceof Error ? error.message : String(error),
          hint: "eristack-workflow init",
        });
      }
    },
  );

  server.registerTool(
    "workflow_init",
    {
      description: "Create .eristack/workflow layout if missing.",
      inputSchema: {},
    },
    async () => formatToolText(initWorkflow(cwd)),
  );

  server.registerTool(
    "index_reindex",
    {
      description:
        "Incremental local reindex (FTS + on-device embeddings). Returns counts only.",
      inputSchema: {
        embed: z.boolean().optional(),
      },
    },
    async ({ embed }) => formatToolText(await client.reindex({ embed })),
  );

  server.registerTool(
    "search",
    {
      description:
        "Hybrid FTS+vector search. Max 8 hits; path, lines, score, ≤3-line snippet.",
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().min(1).max(8).optional(),
      },
    },
    async ({ query, limit }) => {
      const hits = await client.search(query, limit);
      return {
        content: [{ type: "text" as const, text: formatSearchHits(hits) }],
      };
    },
  );

  server.registerTool(
    "read_chunk",
    {
      description:
        "Read a bounded file slice (default ≤80 lines). Prefer after search.",
      inputSchema: {
        path: z.string().min(1),
        startLine: z.number().int().positive().optional(),
        endLine: z.number().int().positive().optional(),
        maxLines: z.number().int().min(1).max(120).optional(),
      },
    },
    async (args) => formatToolText(client.readChunk(args.path, args)),
  );

  server.registerTool(
    "backlog_list",
    {
      description: "List backlog items (id, title, status, priority).",
      inputSchema: {},
    },
    async () =>
      formatToolText(
        client.backlog.list().map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          priority: item.priority,
        })),
      ),
  );

  server.registerTool(
    "backlog_upsert",
    {
      description: "Create or update a backlog item.",
      inputSchema: {
        id: z.string().optional(),
        title: z.string().min(1),
        priority: z.number().optional(),
        status: z
          .enum(["open", "in_progress", "done", "dropped"])
          .optional(),
        notes: z.string().optional(),
      },
    },
    async (args) =>
      formatToolText({
        id: client.backlog.upsert(args).id,
        title: args.title,
        status: args.status ?? "open",
      }),
  );

  server.registerTool(
    "sprint_list",
    {
      description: "List sprints (id, title).",
      inputSchema: {},
    },
    async () =>
      formatToolText(
        client.sprint.list().map((s) => ({ id: s.id, title: s.title })),
      ),
  );

  server.registerTool(
    "sprint_create",
    {
      description: "Create sprint folder with plan/tasks/adr/summary templates.",
      inputSchema: {
        title: z.string().min(1),
        activate: z.boolean().optional(),
      },
    },
    async ({ title, activate }) =>
      formatToolText(client.sprint.create(title, activate !== false)),
  );

  server.registerTool(
    "sprint_get",
    {
      description: "Sprint metadata + task counts + paths (not full files).",
      inputSchema: {
        id: z.string().optional(),
      },
    },
    async ({ id }) => {
      const sprintId = id ?? activeSprintId(client);
      if (!sprintId) {
        return formatToolText({ error: "no active sprint; pass id" });
      }
      return formatToolText(client.sprint.get(sprintId));
    },
  );

  server.registerTool(
    "task_list",
    {
      description: "List tasks for a sprint (id/title/status).",
      inputSchema: {
        sprintId: z.string().optional(),
      },
    },
    async ({ sprintId }) => {
      const id = sprintId ?? activeSprintId(client);
      if (!id) return formatToolText({ error: "no active sprint; pass sprintId" });
      return formatToolText(
        client.sprint.tasks.list(id).map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
        })),
      );
    },
  );

  server.registerTool(
    "task_upsert",
    {
      description: "Create or update a sprint task.",
      inputSchema: {
        sprintId: z.string().optional(),
        id: z.string().optional(),
        title: z.string().min(1),
        status: z.enum(["todo", "doing", "done", "blocked"]).optional(),
        owner: z.string().optional(),
      },
    },
    async ({ sprintId, id, title, status, owner }) => {
      const sid = sprintId ?? activeSprintId(client);
      if (!sid) return formatToolText({ error: "no active sprint; pass sprintId" });
      const saved = client.sprint.tasks.upsert(sid, { id, title, status, owner });
      return formatToolText({
        id: saved.id,
        status: saved.status,
        sprintId: sid,
      });
    },
  );

  server.registerTool(
    "adr_create",
    {
      description: "Create ADR markdown in sprint adr/ folder.",
      inputSchema: {
        sprintId: z.string().optional(),
        title: z.string().min(1),
      },
    },
    async ({ sprintId, title }) => {
      const id = sprintId ?? activeSprintId(client);
      if (!id) return formatToolText({ error: "no active sprint; pass sprintId" });
      return formatToolText(client.sprint.adr.create(id, title));
    },
  );

  server.registerTool(
    "sprint_summarize",
    {
      description:
        "Write summary.md from plan/tasks/ADR titles. Returns path + outline.",
      inputSchema: {
        sprintId: z.string().optional(),
      },
    },
    async ({ sprintId }) => {
      const id = sprintId ?? activeSprintId(client);
      if (!id) return formatToolText({ error: "no active sprint; pass sprintId" });
      return formatToolText(client.sprint.summarize(id));
    },
  );

  server.registerResource(
    "active-sprint-plan",
    "eristack-workflow://sprint/active/plan",
    {
      description: "Active sprint plan.md",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const id = activeSprintId(client);
      if (!id) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: "no active sprint",
            },
          ],
        };
      }
      const sprint = client.sprint.get(id);
      const fs = await import("node:fs");
      const path = await import("node:path");
      const abs = path.resolve(cwd, sprint.planPath);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: fs.readFileSync(abs, "utf8"),
          },
        ],
      };
    },
  );

  return server;
}
