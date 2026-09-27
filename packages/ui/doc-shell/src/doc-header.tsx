import type { ReactNode } from "react";

export type DocHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
};

export function DocHeader({ title, subtitle, badges }: DocHeaderProps) {
  return (
    <header className="erista-doc-header" data-component="doc-header">
      <div className="erista-doc-header__title">{title}</div>
      {subtitle ? <div className="erista-doc-header__subtitle">{subtitle}</div> : null}
      {badges ? <div className="erista-doc-header__badges">{badges}</div> : null}
    </header>
  );
}
