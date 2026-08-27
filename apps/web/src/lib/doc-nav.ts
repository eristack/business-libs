import type { DocMeta } from "@/lib/docs";

export function pageNavLabel(page: DocMeta) {
  return page.slug === "index" ? "Overview" : page.title;
}
