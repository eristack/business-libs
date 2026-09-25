import { visit } from "unist-util-visit";
import type { Element, ElementContent, Root, Text } from "hast";

const CALLOUT_RE = /^\[!([A-Za-z]+)\]\s*/;

const CALLOUT_LABELS: Record<string, string> = {
  agent: "Agent",
  note: "Note",
  warn: "Warning",
  tip: "Tip",
};

function firstTextContent(node: Element): string {
  for (const child of node.children ?? []) {
    if (child.type === "text") return (child as Text).value;
    if (child.type === "element") {
      const nested = firstTextContent(child as Element);
      if (nested) return nested;
    }
  }
  return "";
}

function stripCalloutPrefix(node: Element) {
  const walk = (children: ElementContent[]): boolean => {
    for (const child of children) {
      if (child.type === "text") {
        const text = child as Text;
        if (CALLOUT_RE.test(text.value)) {
          text.value = text.value.replace(CALLOUT_RE, "");
          return true;
        }
        return false;
      }
      if (child.type === "element") {
        if (walk((child as Element).children)) return true;
      }
    }
    return false;
  };
  walk(node.children);
}

/** GitHub-style alerts: `> [!AGENT]` `> [!NOTE]` `> [!WARN]` `> [!TIP]` */
export function rehypeDocsCallouts() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "blockquote" || !parent || typeof index !== "number") {
        return;
      }

      const lead = firstTextContent(node).trim();
      const match = CALLOUT_RE.exec(lead);
      if (!match) return;

      const kind = match[1].toLowerCase();
      stripCalloutPrefix(node);

      const label = CALLOUT_LABELS[kind] ?? kind;

      const aside: Element = {
        type: "element",
        tagName: "aside",
        properties: {
          className: ["docs-callout", `docs-callout--${kind}`],
          "data-callout": kind,
        },
        children: [
          {
            type: "element",
            tagName: "p",
            properties: { className: ["docs-callout__label"] },
            children: [{ type: "text", value: label }],
          },
          {
            type: "element",
            tagName: "div",
            properties: { className: ["docs-callout__body"] },
            children: node.children,
          },
        ],
      };

      parent.children[index] = aside;
    });
  };
}
