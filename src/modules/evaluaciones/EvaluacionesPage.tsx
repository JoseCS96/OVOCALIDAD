import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, ClipboardCheck, Clock3, FlaskConical, PlayCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { iniciarEvaluacion, obtenerPanelEvaluador } from "./api";
import type { PanelEvaluacionItem } from "./types";

function fecha(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function estadoClase(codigo: string) {
  if (codigo === "EN_PROCESO") return "border-blue-200 bg-blue-50 text-blue-700";
  if (codigo === "TERMINADA") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function EvaluacionesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tienePermiso } = useAuth();
  const puedeIniciar = tienePermiso("EVALUACION.INICIAR");
  const puedeVer = tienePermiso("EVALUACION.VER");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["evaluaciones", "mi-panel"],
    queryFn: obtenerPanelEvaluador,
  });

  const iniciarMutation = useMutation({
    mutationFn: iniciarEvaluacion,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["evaluaciones", "mi-panel"] });
      if (response.evaluacionId) navigate(`/operacion/evaluaciones/${response.evaluacionId}`);
    },
  });

  function abrir(item: PanelEvaluacionItem) {
    navigate(`/operacion/evaluaciones/${item.evaluacionId}`);
  }

  if (isLoading) return <PageContainer><div className="py-20 text-center text-[var(--text-secondary)]">Cargando jornada...</div></PageContainer>;
  if (isError || !data) return <PageContainer><div className="py-20 text-center text-red-600">No se pudo cargar el panel de evaluaciones.</div></PageContainer>;

  const { indicadores } = data;

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        eyebrow="Operación · Calidad"
        title="Evaluaciones en línea"
        description="Tu jornada de análisis: toma evaluaciones disponibles, continúa las iniciadas y consulta lo atendido."
        actions={<Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />Actualizar</Button>}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Disponibles", value: indicadores.pendientesDisponibles, hint: "Cola general", icon: ClipboardCheck },
          { label: "En proceso", value: indicadores.enProceso, hint: "A tu cargo", icon: FlaskConical },
          { label: "Iniciadas hoy", value: indicadores.iniciadasHoy, hint: "Tomadas en tu jornada", icon: PlayCircle },
          { label: "Atendidas hoy", value: indicadores.atendidasHoy, hint: "Evaluaciones terminadas", icon: CheckCircle2 },
        ].map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} className="border-[var(--border)] shadow-[var(--shadow-card)]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]"><Icon size={19} /></div>
              <div><p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p><p className="text-2xl font-semibold leading-tight">{value}</p><p className="text-[11px] text-[var(--text-secondary)]">{hint}</p></div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border)]">
            <CardTitle className="text-base">Mis evaluaciones</CardTitle>
            <p className="text-xs text-[var(--text-secondary)]">Evaluaciones que ya tomaste y continúan abiertas.</p>
          </CardHeader>
          <CardContent className="p-0">
            {data.misEvaluaciones.length === 0 ? <div className="px-5 py-12 text-center text-sm text-[var(--text-secondary)]">No tienes evaluaciones en proceso.</div> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[var(--surface-muted)] text-[11px] uppercase tracking-[.08em] text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Lote / producto</th><th className="px-5 py-3">Evaluación</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Inicio</th><th className="px-5 py-3 text-right">Acción</th></tr></thead>
                <tbody>{data.misEvaluaciones.map((item) => <tr key={item.evaluacionId} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4"><p className="font-semibold">{item.codigoLote}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoCodigo} · {item.productoDescripcion}</p></td>
                  <td className="px-5 py-4"><p className="font-medium">{item.tipoEvaluacionDescripcion}</p><p className="text-xs text-[var(--text-secondary)]">Intento {item.intento}</p></td>
                  <td className="px-5 py-4"><Badge variant="outline" className={estadoClase(item.estadoEvaluacionCodigo)}>{item.estadoEvaluacionCodigo.replaceAll("_", " ")}</Badge></td>
                  <td className="px-5 py-4 text-[var(--text-secondary)]">{fecha(item.fechaInicio)}</td>
                  <td className="px-5 py-4 text-right"><Button size="sm" onClick={() => abrir(item)} disabled={!puedeVer}>Continuar <ArrowRight size={14} /></Button></td>
                </tr>)}</tbody>
              </table></div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Resumen de jornada</CardTitle><p className="text-xs text-[var(--text-secondary)]">Tu carga operativa actual.</p></CardHeader>
          <CardContent className="space-y-3">
            {data.resumenEstados.length === 0 ? <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin actividad asignada.</p> : data.resumenEstados.map((item) => (
              <div key={item.estadoCodigo} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <div><p className="text-sm font-semibold">{item.estadoCodigo.replaceAll("_", " ")}</p><p className="max-w-52 truncate text-xs text-[var(--text-secondary)]">{item.estadoDescripcion}</p></div><span className="text-xl font-semibold">{item.cantidad}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border)]">
          <div><CardTitle className="text-base">Pendientes disponibles</CardTitle><p className="mt-1 text-xs text-[var(--text-secondary)]">Evaluaciones aún no tomadas por otro evaluador.</p></div>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{data.pendientesDisponibles.length} disponibles</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {data.pendientesDisponibles.length === 0 ? <div className="flex flex-col items-center gap-2 px-5 py-12 text-center text-sm text-[var(--text-secondary)]"><CheckCircle2 size={26} className="text-emerald-600" /><span>No hay evaluaciones pendientes disponibles.</span></div> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-[11px] uppercase tracking-[.08em] text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Lote</th><th className="px-5 py-3">Producto</th><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Producción</th><th className="px-5 py-3">Estado lote</th><th className="px-5 py-3 text-right">Acción</th></tr></thead>
              <tbody>{data.pendientesDisponibles.map((item) => <tr key={item.evaluacionId} className="border-t border-[var(--border)]">
                <td className="px-5 py-4 font-semibold">{item.codigoLote}</td><td className="px-5 py-4"><p className="font-medium">{item.productoCodigo}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoDescripcion}</p></td><td className="px-5 py-4">{item.tipoEvaluacionDescripcion}</td><td className="px-5 py-4 text-[var(--text-secondary)]">{fecha(item.fechaHoraProduccion)}</td><td className="px-5 py-4"><Badge variant="outline">{item.estadoLoteCodigo.replaceAll("_", " ")}</Badge></td>
                <td className="px-5 py-4 text-right"><Button size="sm" disabled={!puedeIniciar || iniciarMutation.isPending} onClick={() => iniciarMutation.mutate(item.evaluacionId)}><PlayCircle size={14} />{iniciarMutation.isPending ? "Iniciando..." : "Iniciar"}</Button></td>
              </tr>)}</tbody>
            </table></div>
          )}
          {iniciarMutation.isError && <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{iniciarMutation.error instanceof Error ? iniciarMutation.error.message : "No se pudo iniciar la evaluación."}</div>}
        </CardContent>
      </Card>

      {data.atendidasHoy.length > 0 && <Card className="border-[var(--border)] shadow-[var(--shadow-card)]"><CardHeader><CardTitle className="text-base">Atendidas hoy</CardTitle></CardHeader><CardContent className="space-y-2">{data.atendidasHoy.map((item) => <button key={item.evaluacionId} onClick={() => abrir(item)} className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-muted)]"><span><span className="font-semibold">{item.codigoLote}</span><span className="ml-2 text-sm text-[var(--text-secondary)]">{item.productoCodigo}</span></span><span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Clock3 size={13} />{fecha(item.fechaFin)}</span></button>)}</CardContent></Card>}
    </PageContainer>
  );
}
