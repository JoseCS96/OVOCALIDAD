import { Navigate, Route, Routes } from "react-router-dom";
import { BarChart3, Boxes, FileCheck2, Package, Settings } from "lucide-react";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import ModulePlaceholder from "@/components/common/ModulePlaceholder";
import Dashboard from "@/modules/dashboard/Dashboard";
import LoginPage from "@/modules/auth/LoginPage";
import ProtectedRoute from "@/modules/auth/ProtectedRoute";
import LotesPage from "@/modules/lotes/LotesPage";
import LoteDetallePage from "@/modules/lotes/LoteDetallePage";
import EvaluacionEnLineaPage from "@/modules/evaluaciones/EvaluacionEnLineaPage";
import EvaluacionesPage from "@/modules/evaluaciones/EvaluacionesPage";
import ConsolidacionCalidadPage from "@/modules/evaluaciones/ConsolidacionCalidadPage";
import DisposicionPreviewPage from "@/modules/evaluaciones/DisposicionPreviewPage";
import SolicitudesReaperturaPage from "@/modules/evaluaciones/SolicitudesReaperturaPage";
import EspecificacionTecnicaPage from "@/modules/especificaciones/EspecificacionTecnicaPage";
import EspecificacionTecnicaDetallePage from "@/modules/especificaciones/EspecificacionTecnicaDetallePage";
import EspecificacionesTecnicasPage from "@/modules/especificaciones/EspecificacionesTecnicasPage";
import NuevaEspecificacionTecnicaPage from "@/modules/especificaciones/NuevaEspecificacionTecnicaPage";
import NuevaFichaTecnicaPage from "@/modules/fichasTecnicas/NuevaFichaTecnicaPage";
import FichasTecnicasPage from "@/modules/fichasTecnicas/FichasTecnicasPage";
import EditarFichaTecnicaPage from "@/modules/fichasTecnicas/EditarFichaTecnicaPage";
import FasesMantenimientoPage from "@/modules/mantenimientos/FasesMantenimientoPage";
import IngredientesMantenimientoPage from "@/modules/mantenimientos/IngredientesMantenimientoPage";
import CaracteristicasMantenimientoPage from "@/modules/mantenimientos/CaracteristicasMantenimientoPage";
import TiposCaracteristicaMantenimientoPage from "@/modules/mantenimientos/TiposCaracteristicaMantenimientoPage";
import MetodosEnsayoMantenimientoPage from "@/modules/mantenimientos/MetodosEnsayoMantenimientoPage";
import ContenidosRotuladoMantenimientoPage from "@/modules/mantenimientos/ContenidosRotuladoMantenimientoPage";
import CargosMantenimientoPage from "@/modules/mantenimientos/CargosMantenimientoPage";
import ResponsablesMantenimientoPage from "@/modules/mantenimientos/ResponsablesMantenimientoPage";
import TrazabilidadPage from "@/modules/trazabilidad/TrazabilidadPage";
import TrazabilidadDetallePage from "@/modules/trazabilidad/TrazabilidadDetallePage";
import CertificadosPage from "@/modules/certificados/CertificadosPage";
import CertificadoDisenadorPage from "@/modules/certificados/CertificadoDisenadorPage";

const pages = [
  { path: "/productos", title: "Productos", eyebrow: "Gestión documental", description: "Maestro de productos y códigos asociados al proceso de calidad.", icon: Package },
  { path: "/documentos/versiones", title: "Versiones documentales", eyebrow: "Gestión documental", description: "Historial y vigencia de documentos de calidad.", icon: Boxes },
  { path: "/operacion/resultados", title: "Resultados", eyebrow: "Operación", description: "Registro y consulta de resultados de análisis por lote y característica.", icon: BarChart3 },
  { path: "/certificacion/liberaciones", title: "Liberaciones", eyebrow: "Certificación", description: "Control de liberaciones totales y parciales asociadas a lotes.", icon: FileCheck2 },
  { path: "/reportes", title: "Reportes", eyebrow: "Sistema", description: "Indicadores operativos y ejecutivos del proceso de calidad.", icon: BarChart3 },
  { path: "/administracion", title: "Administración", eyebrow: "Sistema", description: "Configuración de catálogos, parámetros y seguridad de OVOCALIDAD.", icon: Settings },
];

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/operacion/lotes" element={<LotesPage />} />
          <Route path="/operacion/lotes/:loteId" element={<LoteDetallePage />} />
          <Route path="/trazabilidad" element={<TrazabilidadPage />} />
          <Route path="/certificacion/certificados" element={<CertificadosPage />} />
          <Route path="/certificacion/certificados/plantillas/:id" element={<CertificadoDisenadorPage />} />
          <Route path="/trazabilidad/:loteId" element={<TrazabilidadDetallePage />} />
          <Route path="/operacion/evaluaciones" element={<EvaluacionesPage />} />
          <Route path="/operacion/evaluaciones/consolidacion" element={<ConsolidacionCalidadPage />} />
          <Route path="/operacion/evaluaciones/disposicion" element={<DisposicionPreviewPage />} />
          <Route path="/operacion/evaluaciones/:evaluacionId" element={<EvaluacionEnLineaPage />} />
          <Route path="/operacion/evaluaciones/reaperturas" element={<SolicitudesReaperturaPage />} />
          <Route path="/documentos/especificaciones/nueva" element={<NuevaEspecificacionTecnicaPage />} />
          <Route path="/documentos/fichas-tecnicas" element={<FichasTecnicasPage />} />
          <Route path="/documentos/fichas-tecnicas/nueva" element={<NuevaFichaTecnicaPage />} />
          <Route path="/documentos/fichas-tecnicas/:versionId/editar" element={<EditarFichaTecnicaPage />} />
          <Route path="/documentos/especificaciones/:versionId" element={<EspecificacionTecnicaDetallePage />} />
          <Route path="/documentos/especificaciones/:versionId/editar" element={<EspecificacionTecnicaPage />} />
          <Route path="/documentos/especificaciones" element={<EspecificacionesTecnicasPage />} />
          <Route element={<ProtectedRoute perfilesPermitidos={["JEFE_CALIDAD"]} />}>
            <Route path="/mantenimientos/fases" element={<FasesMantenimientoPage />} />
            <Route path="/mantenimientos/ingredientes" element={<IngredientesMantenimientoPage />} />
            <Route path="/mantenimientos/caracteristicas" element={<CaracteristicasMantenimientoPage />} />
            <Route path="/mantenimientos/tipos-caracteristica" element={<TiposCaracteristicaMantenimientoPage />} />
            <Route path="/mantenimientos/metodos-ensayo" element={<MetodosEnsayoMantenimientoPage />} />
            <Route path="/mantenimientos/contenidos-rotulado" element={<ContenidosRotuladoMantenimientoPage />} />
            <Route path="/mantenimientos/cargos" element={<CargosMantenimientoPage />} />
            <Route path="/mantenimientos/responsables" element={<ResponsablesMantenimientoPage />} />
          </Route>
          {pages.map((page) => <Route key={page.path} path={page.path} element={<ModulePlaceholder {...page} />} />)}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
