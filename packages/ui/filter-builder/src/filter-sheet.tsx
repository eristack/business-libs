import type { ReactNode } from "react";

export type FilterSheetProps = {
  open?: boolean;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
};

/** Stub filter editor panel — wire to app drawer/sheet styling. */
export function FilterSheet({
  open = false,
  title = "Filters",
  children,
  footer,
}: FilterSheetProps) {
  if (!open) return null;
  return (
    <div className="erista-filter-sheet" data-component="filter-sheet" role="dialog">
      <header className="erista-filter-sheet__header">{title}</header>
      <div className="erista-filter-sheet__body">{children}</div>
      {footer ? <footer className="erista-filter-sheet__footer">{footer}</footer> : null}
    </div>
  );
}
