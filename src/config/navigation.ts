import { BarChart3, Boxes, ClipboardCheck, FileCheck2, FileText, FlaskConical, Home, Package, PenLine, RotateCcw, Settings, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  path?: string;
  icon: LucideIcon;
  moduloCodigo?: string;
  permiso?: string;
  perfilesPermitidos?: string[];
  children?: NavigationItem[];
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
  perfilesPermitidos?: string[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    title: "Inicio",
    items: [
      { label: "Dashboard", path: "/", icon: Home },
    ],
  },

  {
    title: "Gestión documental",
    items: [
      { label: "Productos", path: "/productos", icon: Package, permiso: "PRODUCTO.VER" },
      { label: "Especificaciones técnicas", path: "/documentos/especificaciones", icon: FileText, moduloCodigo: "ESPECIFICACIONES_TECNICAS", permiso: "ET.VER" },
      { label: "Fichas técnicas", path: "/documentos/fichas-tecnicas", icon: FileCheck2, moduloCodigo: "FICHAS_TECNICAS", permiso: "FT.VER" },
      {
        label: "Certificados de calidad",
        icon: ShieldCheck,
        permiso: "CERTIFICADO.VER",
        perfilesPermitidos: ["JEFE_CALIDAD", "ANALISTA_CALIDAD"],
        children: [
          { label: "Plantillas", path: "/documentos/diseno-certificados", icon: FileText, permiso: "CERTIFICADO.VER" },
          { label: "Asignación predeterminada", path: "/documentos/diseno-certificados/asignacion", icon: ShieldCheck, permiso: "CERTIFICADO.VER" },
        ],
      },
      {
        label: "Firma de documentos",
        icon: PenLine,
        children: [
          { label: "Pendientes", path: "/firmas?tab=pendientes", icon: PenLine },
          { label: "Firmados", path: "/firmas?tab=firmados", icon: FileCheck2 },
        ],
      },
      { label: "Versiones", path: "/documentos/versiones", icon: Boxes, permiso: "VERSION_DOCUMENTAL.VER" },
    ],
  },

  {
    title: "Operación",
    items: [
      { label: "Lotes", path: "/operacion/lotes", icon: FlaskConical, moduloCodigo: "LOTES", permiso: "LOTE.VER" },
      { label: "Evaluaciones", path: "/operacion/evaluaciones", icon: ClipboardCheck, moduloCodigo: "LABORATORIO", permiso: "EVALUACION.VER" },
      { label: "Reaperturas", path: "/operacion/evaluaciones/reaperturas", icon: RotateCcw, moduloCodigo: "LABORATORIO", permiso: "EVALUACION.AUTORIZAR_REAPERTURA" },
      { label: "Resultados", path: "/operacion/resultados", icon: BarChart3, moduloCodigo: "LABORATORIO", permiso: "RESULTADO.VER" },
    ],
  },

  {
    title: "Certificación",
    items: [
      {
        label: "Certificados",
        icon: ShieldCheck,
        permiso: "CERTIFICADO.VER",
        perfilesPermitidos: ["JEFE_CALIDAD", "ANALISTA_CALIDAD"],
        children: [
          { label: "Por emitir", path: "/certificacion/certificados?tab=por-emitir", icon: FileCheck2, permiso: "CERTIFICADO.VER" },
          { label: "Emitidos", path: "/certificacion/certificados?tab=emitidos", icon: ShieldCheck, permiso: "CERTIFICADO.VER" },
        ],
      },
      { label: "Liberaciones", path: "/certificacion/liberaciones", icon: FileCheck2, permiso: "LIBERACION.VER" },
    ],
  },

  {
    title: "Configuración de calidad",
    perfilesPermitidos: ["JEFE_CALIDAD"],
    items: [
      {
        label: "Producto y proceso",
        icon: Wrench,
        children: [
          { label: "Fases", path: "/mantenimientos/fases", icon: Wrench },
          { label: "Ingredientes", path: "/mantenimientos/ingredientes", icon: Wrench },
          { label: "Características", path: "/mantenimientos/caracteristicas", icon: Wrench },
          { label: "Tipos de característica", path: "/mantenimientos/tipos-caracteristica", icon: Wrench },
          { label: "Métodos de ensayo", path: "/mantenimientos/metodos-ensayo", icon: Wrench },
        ],
      },
      {
        label: "Documentación",
        icon: FileText,
        children: [
          { label: "Contenido del rotulado", path: "/mantenimientos/contenidos-rotulado", icon: FileText },
          { label: "Cargos", path: "/mantenimientos/cargos", icon: Wrench },
          { label: "Responsables", path: "/mantenimientos/responsables", icon: Wrench },
        ],
      },
      {
        label: "Certificados",
        icon: ShieldCheck,
        children: [
          { label: "Datos institucionales", path: "/mantenimientos/certificados?tab=datos", icon: ShieldCheck },
          { label: "Identidad visual", path: "/mantenimientos/certificados?tab=identidad", icon: ShieldCheck },
          { label: "Firmantes", path: "/mantenimientos/certificados?tab=firmantes", icon: ShieldCheck },
          { label: "Parámetros de certificado", path: "/mantenimientos/certificados?tab=parametros", icon: Settings },
        ],
      },
    ],
  },

  {
    title: "Sistema",
    items: [
      { label: "Trazabilidad", path: "/trazabilidad", icon: Boxes, permiso: "TRAZABILIDAD.VER" },
      { label: "Reportes", path: "/reportes", icon: BarChart3, permiso: "REPORTE.VER" },
      { label: "Administración", path: "/administracion", icon: Settings, permiso: "ADMINISTRACION.VER" },
    ],
  },
];
