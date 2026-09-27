import type { ReactNode } from "react";

export type MasterDetailLayoutProps = {
  master: ReactNode;
  detail: ReactNode;
};

export function MasterDetailLayout({ master, detail }: MasterDetailLayoutProps) {
  return (
    <div className="erista-master-detail" data-component="master-detail-layout">
      <aside className="erista-master-detail__master">{master}</aside>
      <section className="erista-master-detail__detail">{detail}</section>
    </div>
  );
}
