---
title: Overview
description: A two-method HTML→PDF driver contract so invoices, delivery notes, and statements render the same way in Express, workers, and tests — Puppeteer/Playwright/Gotenberg stay in the app.
---

# @eristack/pdf-render

PDF generation in an ERP is a **boundary**: the domain produces HTML (a template + data), something turns it into bytes, and those bytes go to S3, an email, or a download. The "something" is heavy (a headless browser, a container, a SaaS) and changes between environments — Puppeteer locally, a Gotenberg sidecar in K8s, a stub in tests.

`@eristack/pdf-render` is the seam: a `PdfRenderDriver` interface, a `createPdfRenderer(driver)` wrapper, and a deterministic **stub** driver for tests and Backseat. It contains zero rendering code on purpose.

## Use it when

- Your document services should call `pdf.render({ html, title })` and not know which engine is behind it.
- You need tests that produce bytes without launching Chromium.
- Backseat/Horizon-A prototypes need a "Download PDF" button that returns *something*.

## Not for

- Actual PDF layout — write HTML/CSS (print stylesheets, `@page`) and let the driver render it.
- PDF manipulation (merge, sign, fill forms) — `pdf-lib` in the app.
- Spreadsheets — `@eristack/spreadsheet-render`.

## Install

```bash
pnpm add @eristack/pdf-render
# plus your engine, in the app:
pnpm add puppeteer        # or playwright, or nothing for Gotenberg (HTTP)
```

No peers.

## 30-second example

```ts
import { createPdfRenderer, createStubPdfDriver, type PdfRenderDriver } from "@eristack/pdf-render";

// tests / Backseat
const pdf = createPdfRenderer(createStubPdfDriver());

// production — app-owned driver (Puppeteer shown; any engine works)
const puppeteerDriver: PdfRenderDriver = {
  async render({ html }) {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const bytes = await page.pdf({ format: "A4", printBackground: true });
    await page.close();
    return { bytes, contentType: "application/pdf" };
  },
};
const pdfProd = createPdfRenderer(puppeteerDriver);

const { bytes, contentType } = await pdfProd.render({ html: invoiceHtml, title: "INV-2026-0042" });
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `createPdfRenderer` | `(driver: PdfRenderDriver) => { render(input: PdfRenderInput): Promise<PdfRenderOutput> }` | Thin delegate; exists so services depend on the renderer, not the driver. |
| `createStubPdfDriver` | `() => PdfRenderDriver` | Returns `%PDF-stub:<title>\n` + first 64 chars of the HTML as UTF-8 bytes. **Not a valid PDF** — deterministic for snapshot tests. |
| `PdfRenderDriver` | `{ render(input: PdfRenderInput): Promise<PdfRenderOutput> }` | Implement this in the app. |
| `PdfRenderInput` | `{ html: string; title?: string }` | `title` is a hint (document metadata / filename); drivers may ignore it. |
| `PdfRenderOutput` | `{ bytes: Uint8Array; contentType: "application/pdf" }` | |

## Works with

- `@eristack/file-manager` — `uploadFromServer({ originalName, mimeType, body: bytes })` and store the returned `StoredFile.id`/`ref` on the document row.
- `@eristack/checksum` — `sha256Hex(bytes)` beside the ref for later integrity checks.
- `@eristack/outbox` — render in a worker (`"pdf.invoice"` handler), not in the request that posts the invoice.
- `@eristack/comms` — attach the bytes to the email in the same worker.
- `@eristack/spreadsheet-render` — same driver pattern for xlsx/csv.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/pdf-render#pdf-render-core`
- Recipe: `pdf-render-invoice`.

## Next

- [Getting started](./getting-started.md) — production drivers (Puppeteer singleton, Gotenberg HTTP), Express download route, outbox worker, print CSS.
