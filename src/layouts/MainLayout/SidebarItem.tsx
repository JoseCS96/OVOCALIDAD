import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

type SidebarItemProps = {
  icon: LucideIcon;
  text: string;
  active?: boolean;
  collapsed?: boolean;
};

function SidebarItem({ icon: Icon, text, active = false, collapsed = false }: SidebarItemProps) {
  return (
    <button
      type="button"
      title={collapsed ? text : undefined}
      className={[
        "group flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all duration-200",
        collapsed ? "justify-center" : "justify-between gap-3",
        active
          ? "bg-white text-[var(--primary-strong)] shadow-[0_8px_20px_rgba(2,27,38,0.18)]"
          : "text-slate-100/86 hover:bg-white/8 hover:text-white",
      ].join(" ")}
    >
      <span className={["flex min-w-0 items-center", collapsed ? "justify-center" : "gap-3"].join(" ")}>
        <Icon
          size={18}
          strokeWidth={1.9}
          className={active ? "text-[var(--primary)]" : "text-sky-100/80 transition-colors group-hover:text-white"}
        />
        {!collapsed ? <span className="truncate text-[13px] font-medium">{text}</span> : null}
      </span>
      {!collapsed ? (
        <ChevronRight
          size={14}
          className={active ? "text-[var(--primary)]/60" : "text-slate-100/20 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-100/50"}
        />
      ) : null}
    </button>
  );
}

export default SidebarItem;