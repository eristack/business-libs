import { describe, expect, it } from "vitest";
import { createPbac, exportPolicyRegistryForOpenApi } from "@eristack/pbac";
import { documentRoutesOpenApiDocument } from "../src/openapi/index.js";

describe("documentRoutesOpenApiDocument", () => {
  it("merges policy registry extensions", () => {
    const pbac = createPbac();
    pbac.registerPolicy({ id: "order.publication-transition", evaluate: async () => ({ allowed: true }) });

    const doc = documentRoutesOpenApiDocument({
      basePath: "/orders",
      policyRegistry: exportPolicyRegistryForOpenApi(pbac, {
        transitionActions: ["submit", "approve"],
      }),
    });

    expect(doc.paths["/orders/:id/:action"]?.patch).toBeDefined();
    expect(doc["x-eristack-transition-actions"]).toEqual(["approve", "submit"]);
  });
});
