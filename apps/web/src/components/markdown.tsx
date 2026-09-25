import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { codeTheme } from "@/lib/code-theme";
import { cn } from "@/lib/cn";

type MarkdownProps = {
  content: string;
  className?: string;
};

export async function Markdown({ content, className }: MarkdownProps) {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
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
    <article
      className={cn("prose prose-neutral max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
