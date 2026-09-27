import type { ReactNode } from "react";

export type ListToolbarProps = {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function ListToolbar({ leading, trailing, children }: ListToolbarProps) {
  return (
    <div className="erista-list-toolbar" data-component="list-toolbar">
      {leading ? <div className="erista-list-toolbar__leading">{leading}</div> : null}
      {children ?? null}
      {trailing ? <div className="erista-list-toolbar__trailing">{trailing}</div> : null}
    </div>
  );
}
