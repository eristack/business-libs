---
title: Getting started
description: Wire a Puppeteer or Gotenberg driver behind createPdfRenderer, render invoices in an outbox worker, store bytes with file-manager, and serve downloads from Express.
---

# Getting started

## Install

```bash
pnpm add @eristack/pdf-render @eristack/file-manager @eristack/checksum
pnpm add puppeteer        # option A
# option B: run Gotenberg (docker: gotenberg/gotenberg) — no npm dep
```

## Driver A — Puppeteer with a shared browser

Launching Chromium per render is ~1s and hundreds of MB. Keep one browser, open a page per render:

```ts
// pdf-driver.puppeteer.ts
import puppeteer, { type Browser } from "puppeteer";
import type { PdfRenderDriver } from "@eristack/pdf-render";

let browserPromise: Promise<Browser> | undefined;
const browser = () => (browserPromise ??= puppeteer.launch({ headless: true, args: ["--no-sandbox"] }));

export const puppeteerPdfDriver: PdfRenderDriver = {
  async render({ html, title }) {
    const page = await (await browser()).newPage();
    try {
      await page.setContent(html, { waitUntil: "networkidle0" });
      const bytes = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
        displayHeaderFooter: Boolean(title),
        headerTemplate: `<div style="font-size:8px;width:100%;text-align:right;padding-right:14mm">${title ?? ""}</div>`,
        footerTemplate: `<div style="font-size:8px;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
      });
      return { bytes, contentType: "application/pdf" };
    } finally {
      await page.close();
    }
  },
};
```

## Driver B — Gotenberg over HTTP (no Chromium in your process)

```ts
// pdf-driver.gotenberg.ts
import type { PdfRenderDriver } from "@eristack/pdf-render";

export function gotenbergPdfDriver(baseUrl = process.env.GOTENBERG_URL!): PdfRenderDriver {
  return {
    async render({ html }) {
      const form = new FormData();
      form.append("files", new Blob([html], { type: "text/html" }), "index.html");
      form.append("paperWidth", "8.27");    // A4 inches
      form.append("paperHeight", "11.69");
      const res = await fetch(`${baseUrl}/forms/chromium/convert/html`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Gotenberg ${res.status}: ${await res.text()}`);
      return { bytes: new Uint8Array(await res.arrayBuffer()), contentType: "application/pdf" };
    },
  };
}
```

Prefer this on Vercel/serverless — Chromium does not fit comfortably in a function bundle.

## Pick the driver once

```ts
// pdf.ts
import { createPdfRenderer, createStubPdfDriver } from "@eristack/pdf-render";

export const pdf = createPdfRenderer(
  process.env.NODE_ENV === "test" ? createStubPdfDriver()
  : process.env.GOTENBERG_URL ? gotenbergPdfDriver()
  : puppeteerPdfDriver,
);
```

Services import `pdf`; nothing else knows about engines.

## Render in a worker, store with file-manager

```ts
import { sha256Hex } from "@eristack/checksum";

const handlers = {
  "pdf.invoice": async (msg) => {
    const { invoiceId } = JSON.parse(msg.payloadJson);
    const invoice = await loadInvoice(invoiceId);
    const html = renderInvoiceHtml(invoice);                 // your template (React SSR, Handlebars, …)

    const { bytes, contentType } = await pdf.render({ html, title: invoice.number });
    const stored = await fileManager.uploadFromServer({
      originalName: `${invoice.number}.pdf`,
      mimeType: contentType,
      body: bytes,
      namespace: "invoices",
      checksumSha256: sha256Hex(bytes),
      clientUploadId: `invoice-pdf-${invoice.id}`,       // retry-safe: re-running the handler reuses the file
    });
    await db.update(invoices).set({ pdfFileId: stored.id, pdfRefJson: stored.ref }).where(eq(invoices.id, invoice.id));
  },
};
```

Enqueue `"pdf.invoice"` in the same transaction that posts the invoice (`@eristack/outbox`), so a crash between posting and rendering leaves a pending message, not a missing PDF.

## Express download route

```ts
app.get("/invoices/:id/pdf", requireAuth, async (req, res) => {
  const invoice = await loadInvoice(req.params.id);
  if (invoice.pdfFileId) {
    const { url } = await fileManager.resolveDownloadUrl(invoice.pdfFileId);       // presigned GET
    return res.redirect(url);
  }
  // Fallback: render on demand (dev / small volumes)
  const { bytes, contentType } = await pdf.render({ html: renderInvoiceHtml(invoice), title: invoice.number });
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${invoice.number}.pdf"`);
  res.send(Buffer.from(bytes));
});
```

## Print CSS that behaves

```css
@page { size: A4; margin: 0; }            /* let the driver set margins */
table { page-break-inside: auto; }
tr    { page-break-inside: avoid; }
thead { display: table-header-group; }    /* repeat column headers per page */
.total { page-break-before: avoid; }
```

Inline your CSS or use absolute URLs — the renderer has no access to your Vite dev server.

## Gotchas

- The stub returns text bytes starting with `%PDF-stub:` — viewers will reject it. It exists for deterministic tests and Backseat, nothing else.
- `title` is advisory. Puppeteer uses it for header/footer above; Gotenberg ignores it. Set the filename in `Content-Disposition` yourself.
- HTML with external images needs reachable URLs from the renderer (the Gotenberg container, not your laptop). Base64-inline logos.
- Render time is seconds, not milliseconds. Do it in a worker for anything user-facing; the request handler should return `202` or a stored file.
- Money in templates: format with `formatMoney` from `@eristack/money` before building HTML; never `toFixed`.

## Testing

```ts
import { createPdfRenderer, createStubPdfDriver } from "@eristack/pdf-render";
import { expect, it } from "vitest";

it("stub is deterministic and typed", async () => {
  const pdf = createPdfRenderer(createStubPdfDriver());
  const out = await pdf.render({ html: "<h1>INV-1</h1>", title: "INV-1" });
  expect(out.contentType).toBe("application/pdf");
  expect(new TextDecoder().decode(out.bytes)).toBe("%PDF-stub:INV-1\n<h1>INV-1</h1>");
});
```
