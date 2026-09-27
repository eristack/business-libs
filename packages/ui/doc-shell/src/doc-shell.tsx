import type { ReactNode } from "react";

export type DocShellProps = {
  header?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function DocShell({ header, actions, children }: DocShellProps) {
  return (
    <div className="erista-doc-shell" data-component="doc-shell">
      {header ? <div className="erista-doc-shell__header">{header}</div> : null}
      {actions ? <div className="erista-doc-shell__actions">{actions}</div> : null}
      <div className="erista-doc-shell__body">{children}</div>
    </div>
  );
}
