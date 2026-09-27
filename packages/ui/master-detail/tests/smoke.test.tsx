import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MasterDetailLayout } from "../src/index.js";

describe("master-detail", () => {
  it("renders master and detail panes", () => {
    const html = renderToStaticMarkup(
      <MasterDetailLayout master={<nav>List</nav>} detail={<main>Detail</main>} />,
    );
    expect(html).toContain('data-component="master-detail-layout"');
    expect(html).toContain("List");
    expect(html).toContain("Detail");
  });
});
