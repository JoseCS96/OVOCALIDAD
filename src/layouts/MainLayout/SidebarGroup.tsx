import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

function SidebarGroup({ title, children }: Props) {
  return (
    <section className="space-y-2">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100/45">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export default SidebarGroup;