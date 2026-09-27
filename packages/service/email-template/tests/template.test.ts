import { describe, expect, it } from "vitest";

import { extractTemplateKeys, renderEmailTemplate } from "../src/index.js";

describe("extractTemplateKeys", () => {
  it("collects unique keys in sorted order", () => {
    expect(extractTemplateKeys("Hi {{name}}, order {{id}} and {{name}}")).toEqual([
      "id",
      "name",
    ]);
  });
});

describe("renderEmailTemplate", () => {
  it("substitutes placeholders", () => {
    const out = renderEmailTemplate("Hello {{name}}!", { name: "Ada" });
    expect(out).toBe("Hello Ada!");
  });

  it("leaves missing keys empty", () => {
    expect(renderEmailTemplate("{{a}}{{b}}", { a: "x" })).toBe("x");
  });

  it("escapes HTML when requested", () => {
    const out = renderEmailTemplate(
      "<p>{{body}}</p>",
      { body: '<script>alert("x")</script>' },
      { escapeHtml: true },
    );
    expect(out).toBe(
      '<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>',
    );
  });
});
