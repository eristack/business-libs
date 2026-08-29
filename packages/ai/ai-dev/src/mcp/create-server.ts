import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import {
  findRepoRoot,
  formatToolText,
  listEristackPackages,
  planFromGit,
  planFromPaths,
  resolveProfile,
  runChecks,
  runSync,
  summarizeResults,
} from "../index.js";

function cwdFromEnv(): string {
  return process.env.ERISTACK_DEV_CWD || process.cwd();
}

export function createDevMcpServer(cwd = cwdFromEnv()) {
  const server = new McpServer(
    { name: "eristack-dev", version: "0.1.0" },
    { capabilities: { tools: {}, resources: {} } },
  );
  const repoRoot = findRepoRoot(cwd);

  server.registerTool(
    "dev_plan",
    {
      description:
        "Token-minimal plan: changed files → profile, checks, sync, skills, commands. Prefer over reading AGENTS.md.",
      inputSchema: {
        paths: z
          .array(z.string())
          .optional()
          .describe("Optional paths; default git diff vs main"),
        base: z.string().optional().describe("Git base branch, default main"),
      },
    },
    async ({ paths, base }) => {
      const plan =
        paths?.length
          ? planFromPaths(repoRoot, paths)
          : planFromGit(repoRoot, base ?? "main");
      return formatToolText(plan);
    },
  );

  server.registerTool(
    "dev_check",
    {
      description:
        "Run check profile (catalog|pr|full|fast). Returns compact JSON results.",
      inputSchema: {
        profile: z
          .enum([
            "catalog",
            "pr",
            "full",
            "fast",
            "integration",
            "examples",
            "publish",
            "features",
          ])
          .optional()
          .describe("Default pr (CI gate)"),
      },
    },
    async ({ profile }) => {
      const resolved = resolveProfile(profile ?? "pr");
      let packages: string[] | undefined;
      if (resolved === "fast") {
        packages = planFromGit(repoRoot).packages;
      }
      const results = runChecks({ repoRoot, profile: resolved, packages });
      return formatToolText({ ...summarizeResults(results), results });
    },
  );

  server.registerTool(
    "dev_packages",
    {
      description: "List @eristack/* packages with short keys (n, slug, v, flags).",
      inputSchema: {
        docs: z.boolean().optional(),
        skills: z.boolean().optional(),
        ticket: z.boolean().optional(),
      },
    },
    async ({ docs, skills, ticket }) => {
      const pkgs = listEristackPackages(repoRoot, {
        hasDocs: docs || undefined,
        hasSkills: skills || undefined,
        hasTicket: ticket || undefined,
      });
      return formatToolText(
        pkgs.map((p) => ({
          n: p.name,
          slug: p.slug,
          v: p.version,
          docs: p.hasDocs,
          skills: p.hasSkills,
          ticket: p.hasTicket,
        })),
      );
    },
  );

  server.registerTool(
    "dev_knowledge_check",
    {
      description:
        "Run ai-knowledge catalog sync check (pnpm knowledge:check).",
      inputSchema: {},
    },
    async () => {
      const result = runSync(repoRoot, "knowledge", true);
      return formatToolText(result);
    },
  );

  return server;
}

export async function serveDevMcpStdio(cwd = cwdFromEnv()): Promise<void> {
  const { StdioServerTransport } = await import(
    "@modelcontextprotocol/server/stdio"
  );
  const server = createDevMcpServer(cwd);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
