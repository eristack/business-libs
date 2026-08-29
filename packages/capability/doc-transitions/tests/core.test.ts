import { describe, expect, it } from "vitest";
import { createPbac } from "@eristack/pbac";
import {
  PRESET_GRAPHS,
  actionsForStatus,
  describeTransitionGraph,
  isTerminalStatus,
  decisionGraph,
  journalGraph,
  lockGraph,
  pbacTransitionTable,
  publicationGraph,
  registerTransitionGraph,
  transitionPolicyId,
} from "../src/index.js";

describe("preset graphs", () => {
  it("validates all shipped presets", () => {
    for (const graph of PRESET_GRAPHS) {
      expect(graph.id).toBeTruthy();
      expect(Object.keys(graph.table).length).toBeGreaterThan(0);
    }
  });

  it("publication allows submit from draft", () => {
    expect(actionsForStatus(publicationGraph, "draft")).toContain("submit");
    expect(isTerminalStatus(publicationGraph, "published")).toBe(true);
  });
  it("returns empty actions for unknown status", () => {
    expect(actionsForStatus(journalGraph, "nonexistent")).toEqual([]);
  });

  it("lockGraph is never terminal by empty actions alone", () => {
    expect(isTerminalStatus(lockGraph, "locked")).toBe(false);
    expect(isTerminalStatus(lockGraph, "unlocked")).toBe(false);
  });
});

describe("pbacTransitionTable", () => {
  it("omits terminal rows with no outgoing actions", () => {
    const table = pbacTransitionTable(publicationGraph);
    expect(table.published).toBeUndefined();
    expect(table.draft).toContain("submit");
  });

  it("describeTransitionGraph lists sorted actions", () => {
    const meta = describeTransitionGraph(journalGraph);
    expect(meta.actions).toContain("post");
    expect(meta.statuses).toContain("unposted");
  });
});

describe("transitionPolicyId", () => {
  it("follows entity.graph-transition convention", () => {
    expect(transitionPolicyId("invoice", "journal")).toBe(
      "invoice.journal-transition",
    );
  });
});

describe("decisionGraph edges", () => {
  it("denies approve from rejected terminal status", async () => {
    const pbac = createPbac();
    registerTransitionGraph(pbac, { entityKey: "expense", graph: decisionGraph });
    const id = transitionPolicyId("expense", "decision");
    const denied = await pbac.check(id, {
      action: "approve",
      document: { status: "rejected" },
    });
    expect(denied.allowed).toBe(false);
    expect(actionsForStatus(decisionGraph, "rejected")).toEqual([]);
  });
});

describe("registerTransitionGraph", () => {
  it("registers and enforces transitions", async () => {
    const pbac = createPbac();
    registerTransitionGraph(pbac, {
      entityKey: "invoice",
      graph: journalGraph,
    });

    const id = transitionPolicyId("invoice", "journal");
    const ok = await pbac.check(id, {
      action: "post",
      document: { status: "unposted" },
    });
    expect(ok.allowed).toBe(true);

    const denied = await pbac.check(id, {
      action: "post",
      document: { status: "posted" },
    });
    expect(denied.allowed).toBe(false);
  });
});
