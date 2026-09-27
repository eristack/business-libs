import type { ReactNode } from "react";

export type FilterChipBarProps = {
  children?: ReactNode;
};

/** Stub chip row — app renders chips as children. */
export function FilterChipBar({ children }: FilterChipBarProps) {
  return (
    <div className="erista-filter-chip-bar" data-component="filter-chip-bar">
      {children}
    </div>
  );
}
