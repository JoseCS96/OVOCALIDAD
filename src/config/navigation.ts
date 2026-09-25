import { BarChart3, Boxes, ClipboardCheck, FileCheck2, FileText, FlaskConical, Home, Package, Settings, ShieldCheck, type LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  moduloCodigo?: string;
  permiso?: string;
};

export type NavigationGroup = { title: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  { title: "Inicio", items: [{ label: "Dashboard", path: "/", icon: Home }] },
  { title: "Gestión documental", items: [
    { label: "Productos", path: "/productos", icon: Package, permiso: "PRODUCTO.VER" },
    { label: "Especificaciones técnicas", path: "/documentos/especificaciones", icon: FileText, moduloCodigo: "ESPECIFICACIONES_TECNICAS", permiso: "ET.VER" },
    { label: "Fichas técnicas", path: "/documentos/fichas-tecnicas", icon: FileCheck2, permiso: "FICHA_TECNICA.VER" },
    { label: "Versiones", path: "/documentos/versiones", icon: Boxes, permiso: "VERSION_DOCUMENTAL.VER" },
  ]},
  { title: "Operación", items: [
    { label: "Lotes", path: "/operacion/lotes", icon: FlaskConical, moduloCodigo: "LOTES", permiso: "LOTE.VER" },
    { label: "Evaluaciones", path: "/operacion/evaluaciones", icon: ClipboardCheck, moduloCodigo: "LABORATORIO", permiso: "EVALUACION.VER" },
    { label: "Resultados", path: "/operacion/resultados", icon: BarChart3, moduloCodigo: "LABORATORIO", permiso: "RESULTADO.VER" },
  ]},
  { title: "Certificación", items: [
    { label: "Certificados", path: "/certificacion/certificados", icon: ShieldCheck, permiso: "CERTIFICADO.VER" },
    { label: "Liberaciones", path: "/certificacion/liberaciones", icon: FileCheck2, permiso: "LIBERACION.VER" },
  ]},
  { title: "Sistema", items: [
    { label: "Trazabilidad", path: "/trazabilidad", icon: Boxes, permiso: "TRAZABILIDAD.VER" },
    { label: "Reportes", path: "/reportes", icon: BarChart3, permiso: "REPORTE.VER" },
    { label: "Administración", path: "/administracion", icon: Settings, permiso: "ADMINISTRACION.VER" },
  ]},
];
