import { Bell, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { obtenerNotificaciones, marcarModalMostrado, marcarNotificacionLeida } from "@/modules/notificaciones/api";
import type { Notificacion } from "@/modules/notificaciones/types";
import { listarMisSolicitudesFirma, type FirmaDocumentoSolicitud } from "@/modules/firmas/api";
import { NavLink, useNavigate } from "react-router-dom";
import AppLogo from "@/components/branding/AppLogo";
import { navigationGroups, type NavigationItem } from "@/config/navigation";
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
  const [firmasPendientes,setFirmasPendientes]=useState<FirmaDocumentoSolicitud[]>([]);
  const [campanaAbierta,setCampanaAbierta]=useState(false);
  const [modalAbierto,setModalAbierto]=useState(false);
  const pendientes=useMemo(()=>notificaciones.filter(n=>n.mostrarEnCampana&&!n.leida),[notificaciones]);
  const pendientesModal=useMemo(()=>notificaciones.filter(n=>n.mostrarEnModal&&!n.leida),[notificaciones]);
  const pendientesTotal=pendientes.length+firmasPendientes.length;

  useEffect(()=>{
    if(!acceso)return;
    let activo=true;
    const cargar=async()=>{
      try{
        const [data,firmas]=await Promise.all([
          obtenerNotificaciones(),
          listarMisSolicitudesFirma("PENDIENTE")
        ]);
        if(!activo)return;
        setNotificaciones(data);
        setFirmasPendientes(firmas);
        setModalAbierto(data.some((n: Notificacion)=>n.mostrarEnModal&&!n.leida));
      }catch{}
    };
    void cargar();
    const timer=window.setInterval(()=>void cargar(),60000);
    const refrescar=()=>void cargar();
    window.addEventListener("ovocalidad:firmas-updated",refrescar);
    return()=>{activo=false;window.clearInterval(timer);window.removeEventListener("ovocalidad:firmas-updated",refrescar)};
  },[acceso?.usuario.nombreUsuario]);

  async function cerrarModal(){setModalAbierto(false);try{await marcarModalMostrado();setNotificaciones(ns=>ns.map(n=>n.mostrarEnModal?{...n,mostradaModal:true,cantidadVecesModal:n.cantidadVecesModal+1}:n));}catch{}}
  async function abrirNotificacion(n:Notificacion){try{if(!n.leida){await marcarNotificacionLeida(n.notificacionId);setNotificaciones(ns=>ns.map(x=>x.notificacionId===n.notificacionId?{...x,leida:true,mostrarEnModal:false}:x));}}finally{setCampanaAbierta(false);if(n.urlDestino)navigate(n.urlDestino);}}
  async function verSolicitudes(){await cerrarModal();navigate("/documentos/especificaciones");}
  const navigate = useNavigate();

  const canSee = (item: NavigationItem) =>
    (!item.moduloCodigo || tieneModulo(item.moduloCodigo)) &&
    (!item.permiso || tienePermiso(item.permiso));

  const filterItem = (item: NavigationItem): NavigationItem | null => {
    if (!canSee(item)) return null;
    const children = item.children?.map(filterItem).filter((x): x is NavigationItem => !!x) ?? [];
    if (item.children && children.length === 0 && !item.path) return null;
    return {...item, children};
  };

  const groups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.map(filterItem).filter((x): x is NavigationItem => !!x),
    }))
    .filter((group) => group.items.length > 0);

  const nombre = acceso?.usuario.nombresApellidos ?? acceso?.usuario.nombreUsuario ?? "Usuario";
  const perfil = acceso?.perfiles[0]?.perfilDescripcion ?? "Usuario OVOCALIDAD";

  function cerrarSesion() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky print:hidden top-0 z-30 border-b border-[var(--border)] bg-white/92 backdrop-blur">
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
                    {group.items.map((item) => {
                      const Icon=item.icon;

                      if(item.children?.length){
                        return <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.03] p-1.5">
                          <div className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-white">
                            <Icon size={17}/>{item.label}
                          </div>
                          <div className="ml-3 border-l border-white/10 pl-2">
                            {item.children.map((child)=>{
                              if(!child.path)return null;
                              const ChildIcon=child.icon;
                              return <NavLink
                                key={child.path}
                                to={child.path}
                                end={child.path==="/"}
                                className={({isActive})=>[
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                                  isActive?"bg-white text-[var(--primary-strong)]":"text-white/75 hover:bg-white/8 hover:text-white"
                                ].join(" ")}
                              >
                                <ChildIcon size={15}/>{child.label}
                              </NavLink>;
                            })}
                          </div>
                        </div>;
                      }

                      if(!item.path)return null;

                      return <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path==="/"}
                        className={({ isActive }) => ["flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", isActive ? "bg-white text-[var(--primary-strong)]" : "text-white/80 hover:bg-white/8 hover:text-white"].join(" ")}
                      >
                        <Icon size={17} />{item.label}
                      </NavLink>;
                    })}
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
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones" onClick={()=>setCampanaAbierta(v=>!v)}><Bell size={18} />{pendientesTotal>0&&<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-5 text-white">{pendientesTotal>99?"99+":pendientesTotal}</span>}</Button>
          {campanaAbierta&&<div className="absolute right-0 z-50 mt-2 w-[380px] overflow-hidden rounded-2xl border bg-white shadow-xl"><div className="flex items-center justify-between border-b px-4 py-3"><div><p className="font-semibold">Notificaciones</p><p className="text-xs text-slate-500">{pendientesTotal} pendiente{pendientesTotal===1?"":"s"}</p></div></div><div className="max-h-[420px] overflow-y-auto">
 {firmasPendientes.map(f=><button key={"firma-"+f.documentoFirmaSolicitudId} onClick={()=>{setCampanaAbierta(false);if(f.urlDocumento)navigate(f.urlDocumento)}} className="block w-full border-b bg-sky-50/60 px-4 py-3 text-left hover:bg-sky-50"><p className="text-sm font-semibold">Firma pendiente · {f.documentoCodigo}</p><p className="mt-1 text-xs leading-5 text-slate-600">Debes firmar este documento como {f.tipoResponsabilidad.replaceAll("_"," ").toLowerCase()}.</p><p className="mt-1 text-[11px] text-slate-400">{new Date(f.fechaSolicitud).toLocaleString("es-PE")}</p></button>)}
 {notificaciones.length?notificaciones.map(n=><button key={n.notificacionId} onClick={()=>void abrirNotificacion(n)} className={"block w-full border-b px-4 py-3 text-left hover:bg-slate-50 "+(!n.leida?"bg-amber-50/50":"")}><p className="text-sm font-semibold">{n.titulo}</p><p className="mt-1 text-xs leading-5 text-slate-600">{n.mensaje}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(n.audFechaCreacion).toLocaleString("es-PE")}</p></button>):firmasPendientes.length===0?<div className="p-8 text-center text-sm text-slate-500">No tienes notificaciones.</div>:null}
</div></div>}
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
      {modalAbierto&&createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"><div className="relative max-h-[80vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-amber-600">Atención requerida</p><h2 className="mt-1 text-xl font-semibold">Solicitudes de verificación pendientes</h2></div><Button variant="ghost" size="icon" onClick={()=>void cerrarModal()}><X size={18}/></Button></div><p className="mt-3 text-sm text-slate-600">Tienes <b>{pendientesModal.length}</b> nueva{pendientesModal.length===1?"":"s"} solicitud{pendientesModal.length===1?"":"es"} de especificación técnica por revisar.</p><div className="mt-4 max-h-64 overflow-y-auto rounded-xl border">{pendientesModal.map(n=><button key={n.notificacionId} onClick={()=>void abrirNotificacion(n)} className="block w-full border-b px-4 py-3 text-left last:border-0 hover:bg-slate-50"><p className="text-sm font-semibold">{n.mensaje}</p></button>)}</div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={()=>void cerrarModal()}>Cerrar</Button><Button onClick={()=>void verSolicitudes()}>Ver solicitudes</Button></div></div></div>,document.body)}
    </header>
  );
}

export default Topbar;
