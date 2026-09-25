import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import AppLogo from "@/components/branding/AppLogo";
import { navigationGroups } from "@/config/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/modules/auth/AuthContext";

type TopbarProps = { sidebarCollapsed: boolean; onSidebarToggle: () => void };

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Topbar({ sidebarCollapsed, onSidebarToggle }: TopbarProps) {
  const { acceso, logout, tieneModulo } = useAuth();
  const navigate = useNavigate();
  const groups = navigationGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.moduloCodigo || tieneModulo(item.moduloCodigo)) }))
    .filter((group) => group.items.length > 0);

  const nombre = acceso?.usuario.nombresApellidos ?? acceso?.usuario.nombreUsuario ?? "Usuario";
  const perfil = acceso?.perfiles[0]?.perfilDescripcion ?? "Usuario OVOCALIDAD";

  function cerrarSesion() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/92 backdrop-blur">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir navegación"><Menu size={18} /></Button>} />
          <SheetContent side="left" className="w-[292px] border-0 bg-[var(--sidebar)] p-0 text-white">
            <SheetHeader className="sr-only"><SheetTitle>Navegación principal</SheetTitle></SheetHeader>
            <div className="px-6 py-5"><AppLogo /></div>
            <nav className="max-h-[calc(100vh-100px)] overflow-y-auto px-4 pb-6">
              {groups.map((group) => (
                <div key={group.title} className="mb-5">
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100/45">{group.title}</p>
                  <div className="space-y-1">
                    {group.items.map(({ label, path, icon: Icon }) => (
                      <NavLink key={path} to={path} end={path === "/"} className={({ isActive }) => ["flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", isActive ? "bg-white text-[var(--primary-strong)]" : "text-white/80 hover:bg-white/8 hover:text-white"].join(" ")}>
                        <Icon size={17} />{label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Button type="button" variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onSidebarToggle} aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}><Menu size={18} /></Button>
        <div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--text)]">Centro de Operaciones</p><p className="truncate text-xs text-[var(--text-secondary)]">Calidad · OVOSUR</p></div>
        <div className="ml-auto hidden w-full max-w-md lg:block"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><Input aria-label="Buscar en OVOCALIDAD" placeholder="Buscar lotes, productos, documentos..." className="h-10 rounded-xl border-[var(--border)] bg-[var(--surface-muted)] pl-9 shadow-none" /></div></div>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--secondary)] ring-2 ring-white" /></Button>
        <div className="group relative">
          <button type="button" className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50">
            <Avatar className="h-9 w-9"><AvatarFallback className="bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary)]">{getInitials(nombre) || "U"}</AvatarFallback></Avatar>
            <span className="hidden min-w-0 md:block"><span className="block max-w-[180px] truncate text-sm font-semibold text-[var(--text)]">{nombre}</span><span className="block max-w-[180px] truncate text-xs text-[var(--text-secondary)]">{perfil}</span></span><ChevronDown size={15} className="hidden text-slate-400 md:block" />
          </button>
          <div className="invisible absolute right-0 top-full z-50 w-52 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <div className="rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-lg">
              <button type="button" onClick={cerrarSesion} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><LogOut size={16} />Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
