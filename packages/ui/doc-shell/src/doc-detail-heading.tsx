import type { ReactNode } from "react";

export type DocDetailHeadingProps = {
  /** Document number or title — shown once at the top (not repeated in the body by default). */
  documentNumber: ReactNode;
  status?: ReactNode;
  /** One context line: party, job, outstanding, etc. */
  context?: ReactNode;
  primaryAction?: ReactNode;
  printAction?: ReactNode;
  moreMenu?: ReactNode;
};

/**
 * ERP document detail heading: number + status, context line, primary / print / overflow actions.
 * Compose with {@link DocShell} as `header` (and omit a duplicate number in the form body).
 */
export function DocDetailHeading({
  documentNumber,
  status,
  context,
  primaryAction,
  printAction,
  moreMenu,
}: DocDetailHeadingProps) {
  const hasActions = primaryAction != null || printAction != null || moreMenu != null;

  return (
    <header className="erista-doc-detail-heading" data-component="doc-detail-heading">
      <div className="erista-doc-detail-heading__title-row">
        <h1 className="erista-doc-detail-heading__number">{documentNumber}</h1>
        {status ? (
          <div className="erista-doc-detail-heading__status">{status}</div>
        ) : null}
      </div>
      {context ? (
        <p className="erista-doc-detail-heading__context">{context}</p>
      ) : null}
      {hasActions ? (
        <div className="erista-doc-detail-heading__actions">
          <div className="erista-doc-detail-heading__primary">{primaryAction}</div>
          <div className="erista-doc-detail-heading__secondary">
            {printAction}
            {moreMenu}
          </div>
        </div>
      ) : null}
    </header>
  );
}
