import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

type Props = { icon: LucideIcon; text: string; to: string; collapsed?: boolean };

function SidebarItem({ icon: Icon, text, to, collapsed = false }: Props) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      title={collapsed ? text : undefined}
      className={({ isActive }) => [
        "group flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all duration-200",
        collapsed ? "justify-center" : "justify-between gap-3",
        isActive ? "bg-white text-[var(--primary-strong)] shadow-[0_8px_20px_rgba(2,27,38,0.18)]" : "text-slate-100/86 hover:bg-white/8 hover:text-white",
      ].join(" ")}
    >
      {({ isActive }) => (
        <>
          <span className={["flex min-w-0 items-center", collapsed ? "justify-center" : "gap-3"].join(" ")}>
            <Icon size={18} strokeWidth={1.9} className={isActive ? "text-[var(--primary)]" : "text-sky-100/80 group-hover:text-white"} />
            {!collapsed ? <span className="truncate text-[13px] font-medium">{text}</span> : null}
          </span>
          {!collapsed ? <ChevronRight size={14} className={isActive ? "text-[var(--primary)]/60" : "text-slate-100/20 group-hover:text-slate-100/50"} /> : null}
        </>
      )}
    </NavLink>
  );
}

export default SidebarItem;