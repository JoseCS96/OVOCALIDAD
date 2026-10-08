import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AppLogo from "@/components/branding/AppLogo";
import { navigationGroups, type NavigationItem } from "@/config/navigation";
import { useAuth } from "@/modules/auth/AuthContext";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";

type SidebarProps = { collapsed: boolean; onToggle: () => void };

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { tieneModulo, tienePermiso, tienePerfil } = useAuth();
  const location = useLocation();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const canSee = (item: NavigationItem) =>
    (!item.moduloCodigo || tieneModulo(item.moduloCodigo)) &&
    (!item.permiso || tienePermiso(item.permiso)) &&
    (!item.perfilesPermitidos || item.perfilesPermitidos.some(tienePerfil));

  const filterItem = (item: NavigationItem): NavigationItem | null => {
    if (!canSee(item)) return null;
    const children = item.children?.map(filterItem).filter((x): x is NavigationItem => !!x) ?? [];
    if (item.children && children.length === 0 && !item.path) return null;
    return {...item, children};
  };

  const groups = useMemo(
    () =>
      navigationGroups
        .filter((group) => !group.perfilesPermitidos || group.perfilesPermitidos.some(tienePerfil))
        .map((group) => ({
          ...group,
          items: group.items.map(filterItem).filter((x): x is NavigationItem => !!x),
        }))
        .filter((group) => group.items.length > 0),
    [tieneModulo, tienePermiso, tienePerfil]
  );

  const pathAndSearch = location.pathname + location.search;
  const isChildActive = (item: NavigationItem) =>
    item.children?.some((child) => child.path && pathAndSearch === child.path) ?? false;

  const toggleOpen = (label: string) =>
    setOpenItems((actual) => ({...actual, [label]: !(actual[label] ?? true)}));

  return (
    <aside className={["hidden print:hidden h-screen shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,var(--sidebar)_0%,var(--sidebar-strong)_100%)] text-white shadow-[12px_0_36px_rgba(7,45,59,0.12)] transition-[width] duration-300 lg:sticky lg:top-0 lg:flex lg:flex-col", collapsed ? "w-[88px]" : "w-[292px]"].join(" ")}>
      <div className={collapsed ? "px-4 py-5" : "px-6 py-5"}><AppLogo collapsed={collapsed} /></div>
      <div className="mx-4 h-px bg-white/8" />
      <nav className={["flex-1 overflow-y-auto py-5", collapsed ? "px-3" : "px-4"].join(" ")}>
        <div className="space-y-6">
          {groups.map((group) => (
            <SidebarGroup key={group.title} title={collapsed ? "" : group.title}>
              {group.items.map((item) => {
                if (!item.children?.length) {
                  return item.path
                    ? <SidebarItem key={item.path} icon={item.icon} text={item.label} to={item.path} collapsed={collapsed} />
                    : null;
                }

                const open = collapsed ? false : (openItems[item.label] ?? true);
                const active = isChildActive(item);

                return <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    title={collapsed ? item.label : undefined}
                    onClick={()=>!collapsed&&toggleOpen(item.label)}
                    className={[
                      "flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                      collapsed ? "justify-center" : "justify-between gap-3",
                      active ? "bg-white/10 text-white" : "text-slate-100/86 hover:bg-white/8 hover:text-white",
                    ].join(" ")}
                  >
                    <span className={["flex min-w-0 items-center", collapsed ? "justify-center" : "gap-3"].join(" ")}>
                      <item.icon size={18} strokeWidth={1.9} className={active ? "text-[var(--secondary)]" : "text-sky-100/80"} />
                      {!collapsed&&<span className="truncate text-[13px] font-semibold">{item.label}</span>}
                    </span>
                    {!collapsed&&<ChevronDown size={14} className={["transition-transform",open?"rotate-0":"-rotate-90"].join(" ")}/>}
                  </button>

                  {!collapsed&&open&&<div className="ml-5 border-l border-white/10 pl-2">
                    {item.children.map((child)=>child.path?<SidebarItem key={child.path} icon={child.icon} text={child.label} to={child.path} collapsed={false}/>:null)}
                  </div>}
                </div>;
              })}
            </SidebarGroup>
          ))}
        </div>
      </nav>
      <div className="border-t border-white/8 p-3">
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-sky-50/70 transition hover:bg-white/10 hover:text-white">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed ? "Contraer menú" : null}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
