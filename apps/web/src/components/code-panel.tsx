import { Code } from "bright";
import { cn } from "@/lib/utils";
import { codeFontFamily, codeTheme } from "@/lib/code-theme";

type CodePanelProps = {
  code: string;
  filename?: string;
  language?: string;
  caption?: string;
  className?: string;
  lineNumbers?: boolean;
};

/**
 * Product code window — Bright (RSC) for theme, title bar, and highlighting.
 * Used on home + library landings; docs use the same theme via rehype-pretty-code.
 */
export function CodePanel({
  code,
  filename,
  language = "ts",
  caption,
  className,
  lineNumbers = true,
}: CodePanelProps) {
  return (
    <div className={cn("code-panel group", className)}>
      <Code
        lang={language}
        theme={codeTheme}
        title={filename}
        lineNumbers={lineNumbers}
        code={code.trimEnd()}
        className="code-panel-bright"
        style={{
          margin: 0,
          fontFamily: codeFontFamily,
          fontSize: "13.5px",
          lineHeight: 1.7,
          borderRadius: "1rem",
        }}
        titleClassName="!text-[12px] !font-medium tracking-tight"
      />
      {caption ? (
        <p
          className="rounded-b-2xl border border-t-0 border-border bg-muted/50 px-4 py-2.5 text-[11px] text-muted-foreground"
          style={{ fontFamily: codeFontFamily }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
