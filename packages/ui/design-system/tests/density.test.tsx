import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DensityProvider, useDensity } from "../src/react/density.js";

function Probe() {
  const density = useDensity();
  return <span data-density={density} />;
}

describe("DensityProvider", () => {
  it("defaults density context to comfortable", () => {
    const html = renderToStaticMarkup(
      <DensityProvider>
        <Probe />
      </DensityProvider>,
    );
    expect(html).toContain('data-density="comfortable"');
  });
});
