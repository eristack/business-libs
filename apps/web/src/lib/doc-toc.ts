export type TocItem = {
  id: string;
  title: string;
};

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function extractToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of content.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const title = match[2].replace(/`/g, "").trim();
    items.push({ id: slugifyHeading(title), title });
  }
  return items;
}
