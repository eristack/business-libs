import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BusinessPolicyGate, Can } from "../src/index.js";

describe("policy-ui", () => {
  it("renders fallback when not allowed", () => {
    const html = renderToStaticMarkup(
      <Can permission="orders:write" allowed={false} fallback={<span>Denied</span>}>
        <span>Secret</span>
      </Can>,
    );
    expect(html).toContain("Denied");
    expect(html).not.toContain("Secret");
  });

  it("renders children when allowed", () => {
    const html = renderToStaticMarkup(
      <BusinessPolicyGate policyId="invoice:post" allowed>
        <span>Post</span>
      </BusinessPolicyGate>,
    );
    expect(html).toContain("Post");
  });
});
