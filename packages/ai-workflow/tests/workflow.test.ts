import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createWorkflowClient } from "../src/client.js";
import { initWorkflow } from "../src/workflow/init.js";

describe("workflow fs", () => {
  it("inits and creates sprint/backlog/adr/summary", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eristack-wf-"));
    const created = initWorkflow(root);
    expect(created.created.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(root, ".eristack/workflow/config.json"))).toBe(
      true,
    );

    const client = createWorkflowClient(root);
    const sprint = client.sprint.create("Auth sessions");
    expect(fs.existsSync(path.join(root, sprint.path, "plan.md"))).toBe(true);

    const task = client.sprint.tasks.upsert(sprint.id, {
      title: "Wire jwt-auth",
      status: "doing",
    });
    expect(task.id).toBeTruthy();

    const adr = client.sprint.adr.create(sprint.id, "Use opaque refresh");
    expect(adr.path).toContain("ADR-0001");

    const summary = client.sprint.summarize(sprint.id);
    expect(summary.outline.done).toBe(0);
    expect(fs.readFileSync(path.join(root, summary.path), "utf8")).toContain(
      "Wire jwt-auth",
    );

    client.backlog.upsert({ title: "Docs polish", priority: 10 });
    expect(client.backlog.list()).toHaveLength(1);
  });
});
