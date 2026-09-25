import { Bell, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { obtenerNotificaciones, marcarModalMostrado, marcarNotificacionLeida } from "@/modules/notificaciones/api";
import type { Notificacion } from "@/modules/notificaciones/types";
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
  const { acceso, logout, tieneModulo, tienePermiso } = useAuth();
  const [notificaciones,setNotificaciones]=useState<Notificacion[]>([]);
  const [campanaAbierta,setCampanaAbierta]=useState(false);
  const [modalAbierto,setModalAbierto]=useState(false);
  const pendientes=useMemo(()=>notificaciones.filter(n=>!n.leida),[notificaciones]);

  useEffect(()=>{if(!acceso)return;obtenerNotificaciones().then(data=>{setNotificaciones(data);setModalAbierto(data.some((n: Notificacion)=>!n.mostradaModal));}).catch(()=>{});},[acceso?.usuario.nombreUsuario]);

  async function cerrarModal(){setModalAbierto(false);try{await marcarModalMostrado();setNotificaciones(ns=>ns.map(n=>({...n,mostradaModal:true})));}catch{}}
  async function abrirNotificacion(n:Notificacion){try{if(!n.leida){await marcarNotificacionLeida(n.notificacionId);setNotificaciones(ns=>ns.map(x=>x.notificacionId===n.notificacionId?{...x,leida:true}:x));}}finally{setCampanaAbierta(false);if(n.urlDestino)navigate(n.urlDestino);}}
  async function verSolicitudes(){await cerrarModal();navigate("/documentos/especificaciones");}
  const navigate = useNavigate();
  const groups = navigationGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => (!item.moduloCodigo || tieneModulo(item.moduloCodigo)) && (!item.permiso || tienePermiso(item.permiso))) }))
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
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones" onClick={()=>setCampanaAbierta(v=>!v)}><Bell size={18} />{pendientes.length>0&&<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-5 text-white">{pendientes.length>99?"99+":pendientes.length}</span>}</Button>
          {campanaAbierta&&<div className="absolute right-0 z-50 mt-2 w-[380px] overflow-hidden rounded-2xl border bg-white shadow-xl"><div className="flex items-center justify-between border-b px-4 py-3"><div><p className="font-semibold">Notificaciones</p><p className="text-xs text-slate-500">{pendientes.length} pendiente{pendientes.length===1?"":"s"}</p></div></div><div className="max-h-[420px] overflow-y-auto">{notificaciones.length?notificaciones.map(n=><button key={n.notificacionId} onClick={()=>void abrirNotificacion(n)} className={"block w-full border-b px-4 py-3 text-left hover:bg-slate-50 "+(!n.leida?"bg-amber-50/50":"")}><p className="text-sm font-semibold">{n.titulo}</p><p className="mt-1 text-xs leading-5 text-slate-600">{n.mensaje}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(n.audFechaCreacion).toLocaleString("es-PE")}</p></button>):<div className="p-8 text-center text-sm text-slate-500">No tienes notificaciones.</div>}</div></div>}
        </div>
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
      {modalAbierto&&<div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-black/45 p-4"><div className="relative max-h-[80vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-amber-600">Atención requerida</p><h2 className="mt-1 text-xl font-semibold">Solicitudes de verificación pendientes</h2></div><Button variant="ghost" size="icon" onClick={()=>void cerrarModal()}><X size={18}/></Button></div><p className="mt-3 text-sm text-slate-600">Tienes <b>{notificaciones.filter(n=>!n.mostradaModal).length}</b> nueva{notificaciones.filter(n=>!n.mostradaModal).length===1?"":"s"} solicitud{notificaciones.filter(n=>!n.mostradaModal).length===1?"":"es"} de especificación técnica por revisar.</p><div className="mt-4 max-h-64 overflow-y-auto rounded-xl border">{notificaciones.filter(n=>!n.mostradaModal).map(n=><button key={n.notificacionId} onClick={()=>void abrirNotificacion(n)} className="block w-full border-b px-4 py-3 text-left last:border-0 hover:bg-slate-50"><p className="text-sm font-semibold">{n.mensaje}</p></button>)}</div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={()=>void cerrarModal()}>Cerrar</Button><Button onClick={()=>void verSolicitudes()}>Ver solicitudes</Button></div></div></div>}
    </header>
  );
}

export default Topbar;
