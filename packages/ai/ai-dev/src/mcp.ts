import { serveDevMcpStdio } from "./mcp/create-server.js";

serveDevMcpStdio().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
