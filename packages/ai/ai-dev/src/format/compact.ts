/** Serialize for agents: one line, no fluff. */
export function compactJson(value: unknown): string {
  return JSON.stringify(value);
}

export function formatToolText(value: unknown): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [{ type: "text", text: compactJson(value) }],
  };
}
