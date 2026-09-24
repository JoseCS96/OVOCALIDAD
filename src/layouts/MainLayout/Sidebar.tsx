import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FlaskConical,
  Home,
  Package,
  Settings,
  ShieldCheck,
} from "lucide-react";

import AppLogo from "@/components/branding/AppLogo";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const groups = [
  {
    title: "Inicio",
    items: [{ icon: Home, text: "Dashboard", active: true }],
  },
  {
    title: "Gestión documental",
    items: [
      { icon: Package, text: "Productos" },
      { icon: FileText, text: "Especificaciones técnicas" },
      { icon: FileCheck2, text: "Fichas técnicas" },
      { icon: Boxes, text: "Versiones" },
    ],
  },
  {
    title: "Operación",
    items: [
      { icon: FlaskConical, text: "Lotes" },
      { icon: ClipboardCheck, text: "Evaluaciones" },
      { icon: BarChart3, text: "Resultados" },
    ],
  },
  {
    title: "Certificación",
    items: [
      { icon: ShieldCheck, text: "Certificados" },
      { icon: FileCheck2, text: "Liberaciones" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { icon: Boxes, text: "Trazabilidad" },
      { icon: BarChart3, text: "Reportes" },
      { icon: Settings, text: "Administración" },
    ],
  },
];

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={[
        "hidden h-screen shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,var(--sidebar)_0%,var(--sidebar-strong)_100%)] text-white shadow-[12px_0_36px_rgba(7,45,59,0.12)] transition-[width] duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[88px]" : "w-[272px]",
      ].join(" ")}
    >
      <div className={collapsed ? "px-4 py-5" : "px-6 py-5"}>
        <AppLogo collapsed={collapsed} />
      </div>

      <div className="mx-4 h-px bg-white/8" />

      <nav className={["flex-1 overflow-y-auto py-5", collapsed ? "px-3" : "px-4"].join(" ")}>
        <div className="space-y-6">
          {groups.map((group) => (
            <SidebarGroup key={group.title} title={collapsed ? "" : group.title}>
              {group.items.map((item) => (
                <SidebarItem key={item.text} {...item} collapsed={collapsed} />
              ))}
            </SidebarGroup>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/8 p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-sky-50/70 transition hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed ? "Contraer menú" : null}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;