import type { ReactNode } from "react";

export type DocActionBarProps = {
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function DocActionBar({ leading, trailing }: DocActionBarProps) {
  return (
    <div className="erista-doc-action-bar" data-component="doc-action-bar">
      {leading ? <div className="erista-doc-action-bar__leading">{leading}</div> : null}
      {trailing ? <div className="erista-doc-action-bar__trailing">{trailing}</div> : null}
    </div>
  );
}
