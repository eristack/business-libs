import { describe, expect, it } from "vitest";
import { createDevMcpServer } from "../src/mcp/create-server.js";

describe("createDevMcpServer", () => {
  it("constructs stdio MCP server for repo root", () => {
    const server = createDevMcpServer(process.cwd());
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });
});
