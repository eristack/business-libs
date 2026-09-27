const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

export type RenderEmailTemplateOptions = {
  /** When true, substitute values are HTML-escaped (for HTML bodies). */
  escapeHtml?: boolean;
};

export function extractTemplateKeys(template: string): string[] {
  const keys = new Set<string>();
  for (const match of template.matchAll(PLACEHOLDER_RE)) {
    keys.add(match[1]!);
  }
  return [...keys].sort();
}

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Replace `{{key}}` placeholders with vars. Missing keys become empty string.
 */
export function renderEmailTemplate(
  template: string,
  vars: Record<string, string | undefined>,
  options?: RenderEmailTemplateOptions,
): string {
  const escape = options?.escapeHtml ?? false;
  return template.replace(PLACEHOLDER_RE, (_full, key: string) => {
    const raw = vars[key];
    if (raw === undefined) return "";
    return escape ? htmlEscape(raw) : raw;
  });
}
