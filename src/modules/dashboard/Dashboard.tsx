import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, ClipboardCheck, FlaskConical, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MetricCard from "@/components/dashboard/MetricCard";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { obtenerPanelEvaluador } from "@/modules/evaluaciones/api";

function DashboardEvaluador() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["evaluaciones", "mi-panel"],
    queryFn: obtenerPanelEvaluador,
  });

  if (isLoading) return <PageContainer><div className="py-20 text-center text-[var(--text-secondary)]">Cargando jornada...</div></PageContainer>;
  if (isError || !data) return <PageContainer><div className="py-20 text-center text-red-600">No se pudo cargar tu jornada.</div></PageContainer>;

  const { indicadores } = data;
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        eyebrow="OVOCALIDAD 2.0 · CALIDAD"
        title="Mi jornada"
        description="Resumen de tu actividad de evaluación y carga operativa del día."
        actions={<Button onClick={() => navigate("/operacion/evaluaciones")}>Ir a evaluaciones <ArrowRight size={15} /></Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Disponibles" value={indicadores.pendientesDisponibles} description="Evaluaciones por tomar" icon={ClipboardCheck} />
        <MetricCard title="En proceso" value={indicadores.enProceso} description="Actualmente a tu cargo" icon={FlaskConical} tone="info" />
        <MetricCard title="Iniciadas hoy" value={indicadores.iniciadasHoy} description="Tomadas en tu jornada" icon={PlayCircle} tone="warning" />
        <MetricCard title="Atendidas hoy" value={indicadores.atendidasHoy} description="Evaluaciones terminadas" icon={CheckCircle2} tone="success" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Estado de mi jornada</CardTitle><p className="text-xs text-[var(--text-secondary)]">Distribución de tu carga operativa actual.</p></CardHeader>
          <CardContent className="space-y-3">
            {data.resumenEstados.length === 0 ? <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No tienes actividad asignada actualmente.</p> : data.resumenEstados.map((item) => (
              <div key={item.estadoCodigo} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <div><p className="text-sm font-semibold">{item.estadoCodigo.replaceAll("_", " ")}</p><p className="text-xs text-[var(--text-secondary)]">{item.estadoDescripcion}</p></div>
                <span className="text-xl font-semibold">{item.cantidad}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Actividad del día</CardTitle><p className="text-xs text-[var(--text-secondary)]">Indicadores personales de tu jornada.</p></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><p className="text-xs text-[var(--text-secondary)]">Iniciadas</p><p className="mt-1 text-2xl font-semibold">{indicadores.iniciadasHoy}</p></div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><p className="text-xs text-[var(--text-secondary)]">Atendidas</p><p className="mt-1 text-2xl font-semibold">{indicadores.atendidasHoy}</p></div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><p className="text-xs text-[var(--text-secondary)]">En proceso</p><p className="mt-1 text-2xl font-semibold">{indicadores.enProceso}</p></div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><p className="text-xs text-[var(--text-secondary)]">Disponibles</p><p className="mt-1 text-2xl font-semibold">{indicadores.pendientesDisponibles}</p></div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div><p className="font-semibold">Centro de evaluaciones</p><p className="mt-1 text-sm text-[var(--text-secondary)]">Consulta los lotes pendientes, toma una evaluación o continúa las que ya tienes en proceso.</p></div>
          <Button variant="outline" onClick={() => navigate("/operacion/evaluaciones")}>Ver evaluaciones <ArrowRight size={14} /></Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Dashboard() {
  const { tienePermiso } = useAuth();
  const esDashboardEvaluador = tienePermiso("EVALUACION.VER") && tienePermiso("RESULTADO.REGISTRAR") && !tienePermiso("LOTE.VER") && !tienePermiso("ET.VER");

  if (esDashboardEvaluador) return <DashboardEvaluador />;

  return (
    <PageContainer className="space-y-6">
      <PageHeader eyebrow="OVOCALIDAD 2.0" title="Dashboard ejecutivo" description="Visión operativa consolidada de documentos, lotes, evaluaciones y certificación de calidad." />
      <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="p-8 text-sm text-[var(--text-secondary)]">Dashboard consolidado disponible para perfiles con alcance transversal. Sus indicadores se conectarán progresivamente a información real del proceso.</CardContent>
      </Card>
    </PageContainer>
  );
}

export default Dashboard;
