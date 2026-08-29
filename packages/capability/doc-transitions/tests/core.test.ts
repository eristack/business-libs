import { describe, expect, it } from "vitest";
import { createPbac } from "@eristack/pbac";
import {
  PRESET_GRAPHS,
  actionsForStatus,
  isTerminalStatus,
  journalGraph,
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
