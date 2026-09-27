# Getting started

```bash
pnpm add @eristack/pdf-render
```

```ts
import { createPdfRenderer, createStubPdfDriver } from "@eristack/pdf-render";

const renderer = createPdfRenderer(createStubPdfDriver()); // tests only
const { bytes, contentType } = await renderer.render({
  html: "<html>...</html>",
  title: "invoice-1001",
});
```

## Collaboration

App supplies HTML (often from `@eristack/email-template`). Install Puppeteer/Playwright in the app and implement `PdfRenderDriver` for production bytes.
