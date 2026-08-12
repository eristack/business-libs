import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createWorkflowMcpServer } from "./mcp/create-server.js";

serveStdio(() => createWorkflowMcpServer());
