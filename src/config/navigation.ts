import { BarChart3, Boxes, ClipboardCheck, FileCheck2, FileText, FlaskConical, Home, Package, RotateCcw, Settings, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  moduloCodigo?: string;
  permiso?: string;
};

export type NavigationGroup = { title: string; items: NavigationItem[]; perfilesPermitidos?: string[] };

export const navigationGroups: NavigationGroup[] = [
  { title: "Inicio", items: [{ label: "Dashboard", path: "/", icon: Home }] },
  { title: "Gestión documental", items: [
    { label: "Productos", path: "/productos", icon: Package, permiso: "PRODUCTO.VER" },
    { label: "Especificaciones técnicas", path: "/documentos/especificaciones", icon: FileText, moduloCodigo: "ESPECIFICACIONES_TECNICAS", permiso: "ET.VER" },
    { label: "Fichas técnicas", path: "/documentos/fichas-tecnicas", icon: FileCheck2, moduloCodigo: "FICHAS_TECNICAS", permiso: "FT.VER" },
    { label: "Versiones", path: "/documentos/versiones", icon: Boxes, permiso: "VERSION_DOCUMENTAL.VER" },
  ]},
  { title: "Operación", items: [
    { label: "Lotes", path: "/operacion/lotes", icon: FlaskConical, moduloCodigo: "LOTES", permiso: "LOTE.VER" },
    { label: "Evaluaciones", path: "/operacion/evaluaciones", icon: ClipboardCheck, moduloCodigo: "LABORATORIO", permiso: "EVALUACION.VER" },
    { label: "Reaperturas", path: "/operacion/evaluaciones/reaperturas", icon: RotateCcw, moduloCodigo: "LABORATORIO", permiso: "EVALUACION.AUTORIZAR_REAPERTURA" },
    { label: "Resultados", path: "/operacion/resultados", icon: BarChart3, moduloCodigo: "LABORATORIO", permiso: "RESULTADO.VER" },
  ]},
  { title: "Certificación", items: [
    { label: "Certificados", path: "/certificacion/certificados", icon: ShieldCheck, permiso: "CERTIFICADO.VER" },
    { label: "Liberaciones", path: "/certificacion/liberaciones", icon: FileCheck2, permiso: "LIBERACION.VER" },
  ]},
  { title: "Mantenimientos", perfilesPermitidos: ["JEFE_CALIDAD"], items: [
    { label: "Fases", path: "/mantenimientos/fases", icon: Wrench },
    { label: "Ingredientes", path: "/mantenimientos/ingredientes", icon: Wrench },
    { label: "Características", path: "/mantenimientos/caracteristicas", icon: Wrench },
    { label: "Tipos de característica", path: "/mantenimientos/tipos-caracteristica", icon: Wrench },
    { label: "Métodos de ensayo", path: "/mantenimientos/metodos-ensayo", icon: Wrench },
    { label: "Contenido del Rotulado", path: "/mantenimientos/contenidos-rotulado", icon: Wrench },
    { label: "Cargos", path: "/mantenimientos/cargos", icon: Wrench },
    { label: "Responsables", path: "/mantenimientos/responsables", icon: Wrench },
  ]},
  { title: "Sistema", items: [
    { label: "Trazabilidad", path: "/trazabilidad", icon: Boxes, permiso: "TRAZABILIDAD.VER" },
    { label: "Reportes", path: "/reportes", icon: BarChart3, permiso: "REPORTE.VER" },
    { label: "Administración", path: "/administracion", icon: Settings, permiso: "ADMINISTRACION.VER" },
  ]},
];
