import { visit } from "unist-util-visit";
import type { Element, ElementContent, Root, Text } from "hast";

/** Fences that are structural diagrams, not syntax-highlighted source. */
const DIAGRAM_LANGS = new Set([
  "text",
  "ascii",
  "diagram",
  "plain",
  "plaintext",
]);

function languageFromClassName(className: unknown): string | null {
  const classes = Array.isArray(className)
    ? className
    : typeof className === "string"
      ? className.split(/\s+/)
      : [];
  for (const entry of classes) {
    if (typeof entry === "string" && entry.startsWith("language-")) {
      return entry.slice("language-".length).toLowerCase();
    }
  }
  return null;
}

function collectText(nodes: ElementContent[] | undefined): string {
  if (!nodes?.length) return "";
  let out = "";
  for (const node of nodes) {
    if (node.type === "text") {
      out += (node as Text).value;
      continue;
    }
    if (node.type === "element") {
      out += collectText(node.children);
    }
  }
  return out;
}

/**
 * Lift ```text / ```ascii / ```diagram fences into a dedicated diagram panel
 * before rehype-pretty-code runs, so box-drawing stays monospaced (no Shiki
 * spans, no JetBrains subset glyph fallback).
 */
export function rehypeDocsDiagram() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || typeof index !== "number") {
        return;
      }

      const code = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "code",
      );
      if (!code) return;

      const lang = languageFromClassName(code.properties?.className);
      if (!lang || !DIAGRAM_LANGS.has(lang)) return;

      const value = collectText(code.children).replace(/\n$/, "");

      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: {
          className: ["docs-diagram"],
          "data-docs-diagram": "",
          "data-language": lang,
        },
        children: [
          {
            type: "element",
            tagName: "pre",
            properties: { className: ["docs-diagram__pre"] },
            children: [{ type: "text", value }],
          },
        ],
      };

      parent.children[index] = figure;
    });
  };
}
