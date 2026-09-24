import { BarChart3, Boxes, ClipboardCheck, FileCheck2, FileText, FlaskConical, Home, Package, Settings, ShieldCheck, type LucideIcon } from "lucide-react";

export type NavigationItem = { label: string; path: string; icon: LucideIcon };
export type NavigationGroup = { title: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  { title: "Inicio", items: [{ label: "Dashboard", path: "/", icon: Home }] },
  { title: "Gestión documental", items: [
    { label: "Productos", path: "/productos", icon: Package },
    { label: "Especificaciones técnicas", path: "/documentos/especificaciones", icon: FileText },
    { label: "Fichas técnicas", path: "/documentos/fichas-tecnicas", icon: FileCheck2 },
    { label: "Versiones", path: "/documentos/versiones", icon: Boxes },
  ]},
  { title: "Operación", items: [
    { label: "Lotes", path: "/operacion/lotes", icon: FlaskConical },
    { label: "Evaluaciones", path: "/operacion/evaluaciones", icon: ClipboardCheck },
    { label: "Resultados", path: "/operacion/resultados", icon: BarChart3 },
  ]},
  { title: "Certificación", items: [
    { label: "Certificados", path: "/certificacion/certificados", icon: ShieldCheck },
    { label: "Liberaciones", path: "/certificacion/liberaciones", icon: FileCheck2 },
  ]},
  { title: "Sistema", items: [
    { label: "Trazabilidad", path: "/trazabilidad", icon: Boxes },
    { label: "Reportes", path: "/reportes", icon: BarChart3 },
    { label: "Administración", path: "/administracion", icon: Settings },
  ]},
];