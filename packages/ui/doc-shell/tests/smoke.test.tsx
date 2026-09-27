import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DocActionBar, DocHeader, DocShell } from "../src/index.js";

describe("doc-shell", () => {
  it("renders document chrome", () => {
    const html = renderToStaticMarkup(
      <DocShell
        header={<DocHeader title="INV-1001" subtitle="Draft" />}
        actions={<DocActionBar trailing={<button>Save</button>} />}
      >
        <form />
      </DocShell>,
    );
    expect(html).toContain("INV-1001");
    expect(html).toContain('data-component="doc-shell"');
  });
});
