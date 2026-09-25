import { Navigate, Route, Routes } from "react-router-dom";
import { BarChart3, Boxes, ClipboardCheck, FileCheck2, FileText, Package, Settings, ShieldCheck } from "lucide-react";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import ModulePlaceholder from "@/components/common/ModulePlaceholder";
import Dashboard from "@/modules/dashboard/Dashboard";
import LotesPage from "@/modules/lotes/LotesPage";
import LoteDetallePage from "@/modules/lotes/LoteDetallePage";
import EvaluacionEnLineaPage from "@/modules/evaluaciones/EvaluacionEnLineaPage";
import EspecificacionTecnicaPage from "@/modules/especificaciones/EspecificacionTecnicaPage";
import EspecificacionTecnicaDetallePage from "@/modules/especificaciones/EspecificacionTecnicaDetallePage";
import EspecificacionesTecnicasPage from "@/modules/especificaciones/EspecificacionesTecnicasPage";

const pages = [
  { path: "/productos", title: "Productos", eyebrow: "Gestión documental", description: "Maestro de productos y códigos asociados al proceso de calidad.", icon: Package },
  { path: "/documentos/fichas-tecnicas", title: "Fichas técnicas", eyebrow: "Gestión documental", description: "Consulta y control de fichas técnicas utilizadas para certificación.", icon: FileCheck2 },
  { path: "/documentos/versiones", title: "Versiones documentales", eyebrow: "Gestión documental", description: "Historial y vigencia de documentos de calidad.", icon: Boxes },
  { path: "/operacion/evaluaciones", title: "Evaluaciones", eyebrow: "Operación", description: "Evaluación de cumplimiento, reevaluaciones y decisiones de calidad.", icon: ClipboardCheck },
  { path: "/operacion/resultados", title: "Resultados", eyebrow: "Operación", description: "Registro y consulta de resultados de análisis por lote y característica.", icon: BarChart3 },
  { path: "/certificacion/certificados", title: "Certificados", eyebrow: "Certificación", description: "Generación, aprobación y emisión de certificados de calidad.", icon: ShieldCheck },
  { path: "/certificacion/liberaciones", title: "Liberaciones", eyebrow: "Certificación", description: "Control de liberaciones totales y parciales asociadas a lotes.", icon: FileCheck2 },
  { path: "/trazabilidad", title: "Trazabilidad", eyebrow: "Sistema", description: "Consulta integral del historial de documentos, lotes, evaluaciones y certificados.", icon: Boxes },
  { path: "/reportes", title: "Reportes", eyebrow: "Sistema", description: "Indicadores operativos y ejecutivos del proceso de calidad.", icon: BarChart3 },
  { path: "/administracion", title: "Administración", eyebrow: "Sistema", description: "Configuración de catálogos, parámetros y seguridad de OVOCALIDAD.", icon: Settings },
];

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/operacion/lotes" element={<LotesPage />} />
        <Route path="/operacion/lotes/:loteId" element={<LoteDetallePage />} />
        <Route path="/operacion/evaluaciones/:evaluacionId" element={<EvaluacionEnLineaPage />} />
        <Route path="/documentos/especificaciones/:versionId" element={<EspecificacionTecnicaDetallePage />} />
        <Route path="/documentos/especificaciones/:versionId/editar" element={<EspecificacionTecnicaPage />} />
        <Route path="/documentos/especificaciones" element={<EspecificacionesTecnicasPage />} />
        {pages.map((page) => <Route key={page.path} path={page.path} element={<ModulePlaceholder {...page} />} />)}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
