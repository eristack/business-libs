import type { PdfRenderDriver, PdfRenderInput, PdfRenderOutput } from "./types.js";

export function createPdfRenderer(driver: PdfRenderDriver) {
  return {
    render(input: PdfRenderInput): Promise<PdfRenderOutput> {
      return driver.render(input);
    },
  };
}

/** Deterministic stub bytes for tests and Backseat — not a valid PDF for production. */
export function createStubPdfDriver(): PdfRenderDriver {
  return {
    async render(input) {
      const marker = `%PDF-stub:${input.title ?? "doc"}\n`;
      return {
        bytes: new TextEncoder().encode(marker + input.html.slice(0, 64)),
        contentType: "application/pdf",
      };
    },
  };
}
