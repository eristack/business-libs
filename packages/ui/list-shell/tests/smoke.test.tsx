import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ListPageLayout, QueryStateBanner } from "../src/index.js";

describe("list-shell", () => {
  it("renders loading banner", () => {
    const html = renderToStaticMarkup(
      <ListPageLayout banner={<QueryStateBanner isLoading />}>
        <table />
      </ListPageLayout>,
    );
    expect(html).toContain('data-state="loading"');
  });
});
