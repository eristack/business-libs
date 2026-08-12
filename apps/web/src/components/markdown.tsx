import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root } from "hast";
import { codeTheme } from "@/lib/code-theme";

function rewriteDocHref(href: string, packageSlug?: string) {
  if (!packageSlug) return href;
  if (href.startsWith("http") || href.startsWith("#") || href.startsWith("/")) {
    return href;
  }

  const cleaned = href.replace(/^\.\//, "").replace(/\.md$/, "");
  if (cleaned === "index" || cleaned === "") {
    return `/docs/${packageSlug}`;
  }
  return `/docs/${packageSlug}/${cleaned}`;
}

function rehypeRewriteDocLinks(packageSlug?: string) {
  return (tree: Root) => {
    if (!packageSlug) return;
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string") return;
      node.properties.href = rewriteDocHref(href, packageSlug);
      if (String(node.properties.href).startsWith("http")) {
        node.properties.target = "_blank";
        node.properties.rel = ["noreferrer"];
      }
    });
  };
}

type MarkdownProps = {
  content: string;
  packageSlug?: string;
};

export async function Markdown({ content, packageSlug }: MarkdownProps) {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeRewriteDocLinks, packageSlug)
    .use(rehypePrettyCode, {
      theme: {
        dark: codeTheme.dark,
        light: codeTheme.light,
      },
      keepBackground: true,
      defaultLang: "ts",
    })
    .use(rehypeStringify)
    .process(content);

  return (
    <div
      className="prose-docs"
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
