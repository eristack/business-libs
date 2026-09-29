---
name: pdf-render-core
description: >
  @eristack/pdf-render createPdfRenderer(driver).render({ html, title? }) → { bytes, contentType }
  behind a PdfRenderDriver seam; createStubPdfDriver for tests/Backseat (not a valid PDF).
  App owns the engine (Puppeteer singleton or Gotenberg HTTP). Use for invoice/delivery-note
  PDFs rendered in an @eristack/outbox worker and stored via @eristack/file-manager.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/pdf-render"
sources:
  - packages/service/pdf-render/docs/getting-started.md
---

# @eristack/pdf-render

Interface + stub. Zero rendering code here by design.

```ts
import { createPdfRenderer, createStubPdfDriver, type PdfRenderDriver } from "@eristack/pdf-render";

const driver: PdfRenderDriver = { async render({ html, title }) { /* puppeteer page.pdf | Gotenberg POST */ return { bytes, contentType: "application/pdf" }; } };
export const pdf = createPdfRenderer(process.env.NODE_ENV === "test" ? createStubPdfDriver() : driver);

const { bytes, contentType } = await pdf.render({ html, title: invoice.number });
```

## Checklist

1. One driver module: Puppeteer with a **shared browser** (page per render) or Gotenberg over HTTP (serverless-friendly). Export a single `pdf` renderer.
2. Render in an `@eristack/outbox` handler enqueued with the posting transaction; never inline in the POST.
3. Store via `@eristack/file-manager` `uploadFromServer({ originalName, mimeType, body, namespace, checksumSha256: sha256Hex(bytes), clientUploadId })`; keep `stored.id` on the document row.
4. Download route: `const { url } = await resolveDownloadUrl(fileId)` → redirect; set `Content-Disposition` filename yourself (`title` is advisory).
5. HTML: inline CSS, base64 images, `formatMoney` from `@eristack/money`, print CSS (`thead { display: table-header-group }`).

## Do not

- Ship the stub to users — bytes start with `%PDF-stub:` and are not a PDF.
- Launch Chromium per request or inside a Vercel function bundle.
- Merge/sign PDFs here (`pdf-lib` in app) or render spreadsheets (`@eristack/spreadsheet-render`).
