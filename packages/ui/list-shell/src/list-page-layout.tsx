import type { ReactNode } from "react";

export type ListPageLayoutProps = {
  toolbar?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
};

export function ListPageLayout({ toolbar, banner, children }: ListPageLayoutProps) {
  return (
    <div className="erista-list-page" data-component="list-page-layout">
      {toolbar ? <div className="erista-list-page__toolbar">{toolbar}</div> : null}
      {banner ? <div className="erista-list-page__banner">{banner}</div> : null}
      <div className="erista-list-page__body">{children}</div>
    </div>
  );
}
