import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MultitabProvider, useMultitab } from "../src/react/provider.js";

function EmptyProbe() {
  const multitab = useMultitab();
  return (
    <span data-empty={multitab.isWorkspaceEmpty ? "yes" : "no"}>
      {multitab.tabs.length} tabs
    </span>
  );
}

function TabProbe() {
  const multitab = useMultitab();
  return <span>{multitab.activeTab?.title ?? "none"}</span>;
}

describe("MultitabProvider", () => {
  it("renders empty workspace", () => {
    const html = renderToStaticMarkup(
      <MultitabProvider>
        <EmptyProbe />
      </MultitabProvider>,
    );
    expect(html).toContain('data-empty="yes"');
    expect(html).toContain("0 tabs");
  });

  it("renders seeded tabs from initialState", () => {
    const html = renderToStaticMarkup(
      <MultitabProvider
        initialState={{
          tabs: [
            {
              id: "/orders",
              title: "Orders",
              kind: "route",
              sequence: 0,
            },
          ],
          activeTabId: "/orders",
          recentTabIds: ["/orders"],
        }}
      >
        <TabProbe />
      </MultitabProvider>,
    );
    expect(html).toContain("Orders");
  });

  it("throws when useMultitab is used outside provider", () => {
    function Orphan() {
      useMultitab();
      return null;
    }
    expect(() => renderToStaticMarkup(<Orphan />)).toThrow(
      "useMultitab must be used within MultitabProvider",
    );
  });
});
