import { createWorkflowClient } from "./client.js";
import { formatSearchHits, compactJson } from "./format/compact.js";
import { initWorkflow } from "./workflow/init.js";

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const cwd = process.cwd();
  const client = createWorkflowClient(cwd);

  switch (cmd) {
    case "init": {
      console.log(compactJson(initWorkflow(cwd)));
      return;
    }
    case "status": {
      console.log(compactJson(client.status()));
      return;
    }
    case "index": {
      const noEmbed = rest.includes("--no-embed");
      console.log(compactJson(await client.reindex({ embed: !noEmbed })));
      return;
    }
    case "search": {
      const query = rest.filter((arg) => !arg.startsWith("--")).join(" ").trim();
      if (!query) {
        console.error("Usage: eristack-workflow search <query>");
        process.exitCode = 1;
        return;
      }
      console.log(formatSearchHits(await client.search(query)));
      return;
    }
    case "sprint": {
      const sub = rest[0];
      if (sub === "create") {
        const titleIdx = rest.indexOf("--title");
        const title =
          titleIdx >= 0
            ? rest[titleIdx + 1]
            : rest.slice(1).filter((a) => !a.startsWith("--")).join(" ");
        if (!title) {
          console.error('Usage: eristack-workflow sprint create --title "..."');
          process.exitCode = 1;
          return;
        }
        console.log(compactJson(client.sprint.create(title)));
        return;
      }
      if (sub === "list") {
        console.log(
          compactJson(
            client.sprint.list().map((s) => ({ id: s.id, title: s.title })),
          ),
        );
        return;
      }
      if (sub === "get") {
        const id = rest[1];
        if (!id) {
          console.error("Usage: eristack-workflow sprint get <id>");
          process.exitCode = 1;
          return;
        }
        console.log(compactJson(client.sprint.get(id)));
        return;
      }
      if (sub === "summarize") {
        const id = rest[1] ?? client.status().activeSprintId;
        if (!id) {
          console.error("Usage: eristack-workflow sprint summarize <id>");
          process.exitCode = 1;
          return;
        }
        console.log(compactJson(client.sprint.summarize(id)));
        return;
      }
      console.error(
        "Usage: eristack-workflow sprint <create|list|get|summarize>",
      );
      process.exitCode = 1;
      return;
    }
    case "help":
    case undefined: {
      console.log(`eristack-workflow <command>

Commands:
  init                 Create .eristack/workflow layout
  status               Compact status JSON
  index [--no-embed]   Incremental reindex
  search <query>       Hybrid ranked search (compact)
  sprint create --title <title>
  sprint list|get|summarize

MCP:
  eristack-workflow-mcp
`);
      return;
    }
    default: {
      console.error(`Unknown command: ${cmd}`);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
