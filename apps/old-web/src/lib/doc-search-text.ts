/** Strip markdown to plain text for search indexing (build-time only). */
export function stripMarkdownForSearch(markdown: string, maxLength = 1200): string {
  let text = markdown;

  // Drop frontmatter if present
  text = text.replace(/^---[\s\S]*?---\n/, "");

  // Code blocks → space
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`[^`]+`/g, " ");

  // Links: [label](url) → label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Headings / emphasis / block markers
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/[*_~>|]/g, " ");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
