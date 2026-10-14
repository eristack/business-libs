import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DocActionBar, DocDetailHeading, DocHeader, DocShell } from "../src/index.js";

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

  it("renders DocDetailHeading slots", () => {
    const html = renderToStaticMarkup(
      <DocDetailHeading
        documentNumber="INV-1001"
        status={<span>Draft</span>}
        context="Acme · Job J-42 · Outstanding IDR 1,000,000"
        primaryAction={<button type="button">Record payment</button>}
        printAction={<button type="button">Print</button>}
        moreMenu={<button type="button">More</button>}
      />,
    );
    expect(html).toContain('data-component="doc-detail-heading"');
    expect(html).toContain("INV-1001");
    expect(html).toContain("Record payment");
  });
});
