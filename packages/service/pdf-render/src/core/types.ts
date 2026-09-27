export type PdfRenderInput = {
  html: string;
  title?: string;
};

export type PdfRenderOutput = {
  bytes: Uint8Array;
  contentType: "application/pdf";
};

export interface PdfRenderDriver {
  render(input: PdfRenderInput): Promise<PdfRenderOutput>;
}
