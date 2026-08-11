type TocItem = {
  id: string;
  title: string;
};

function slugify(value: string) {
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
    items.push({ id: slugify(title), title });
  }
  return items;
}

export function DocsToc({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;

  return (
    <aside className="hidden w-52 shrink-0 xl:block 2xl:w-56">
      <div className="sticky top-[4.5rem]">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          On this page
        </p>
        <nav className="flex flex-col gap-2 border-l border-border pl-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-[12.5px] leading-5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
