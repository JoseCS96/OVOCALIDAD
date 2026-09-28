import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Calculator, CheckCircle2, Eye, RefreshCw, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { consolidarEvaluaciones, listarEvaluacionesPendientesCalculo, precalcularDisposicion } from "./api";
import type { PrecalculoEvaluacionesResponse } from "./types";

function fecha(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function badge(resultado: string) {
  if (resultado === "CUMPLE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (resultado === "NO_CUMPLE") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function ConsolidacionCalidadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tienePermiso } = useAuth();
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [preview, setPreview] = useState<PrecalculoEvaluacionesResponse | null>(null);
  const [resultadoGuardado, setResultadoGuardado] = useState<string | null>(null);

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["evaluaciones", "pendientes-calculo"],
    queryFn: listarEvaluacionesPendientesCalculo,
    enabled: tienePermiso("EVALUACION.CONSOLIDAR"),
  });

  const seleccionCompleta = data.length > 0 && data.every(x => seleccionados.includes(x.evaluacionId));

  const calcularMutation = useMutation({
    mutationFn: () => precalcularDisposicion(seleccionados),
    onSuccess: (response) => {
      setPreview(response);
      setResultadoGuardado(null);
    },
  });

  const guardarMutation = useMutation({
    mutationFn: () => consolidarEvaluaciones(
      preview?.evaluaciones.filter(x => x.esCalculable && x.precalculo === "CUMPLE").map(x => x.evaluacionId) ?? [],
    ),
    onSuccess: async (response) => {
      const ok = response.filter(x => x.procesado).length;
      const errores = response.length - ok;
      setResultadoGuardado(`${ok} evaluación(es) consolidada(s)${errores ? `; ${errores} no procesada(s)` : ""}.`);
      setPreview(null);
      setSeleccionados([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["evaluaciones", "pendientes-calculo"] }),
        queryClient.invalidateQueries({ queryKey: ["evaluaciones", "mi-panel"] }),
        queryClient.invalidateQueries({ queryKey: ["lotes"] }),
      ]);
    },
  });

  const resumen = useMemo(() => {
    const items = preview?.evaluaciones ?? [];
    return {
      cumple: items.filter(x => x.precalculo === "CUMPLE").length,
      noCumple: items.filter(x => x.precalculo === "NO_CUMPLE").length,
      incompleto: items.filter(x => x.precalculo === "INCOMPLETO").length,
    };
  }, [preview]);

  if (!tienePermiso("EVALUACION.CONSOLIDAR")) {
    return <PageContainer><div className="py-20 text-center text-sm text-red-600">No tienes permiso para consolidar evaluaciones.</div></PageContainer>;
  }

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        eyebrow="Operación · Calidad"
        title="Evaluaciones pendientes de consolidación"
        description="Revisa evaluaciones terminadas, calcula la disposición propuesta y libera únicamente después de confirmar el resultado."
        actions={<Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />Actualizar</Button>}
      />

      {resultadoGuardado && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{resultadoGuardado}</div>}

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-[var(--border)]">
          <div><CardTitle className="text-base">Pendientes de decisión</CardTitle><p className="mt-1 text-xs text-[var(--text-secondary)]">{data.length} evaluación(es) terminada(s) pendientes de consolidar.</p></div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={data.length === 0} onClick={() => { setSeleccionados(seleccionCompleta ? [] : data.map(x => x.evaluacionId)); setPreview(null); }}>
              {seleccionCompleta ? "Quitar selección" : "Seleccionar todos"}
            </Button>
            <Button disabled={seleccionados.length === 0 || calcularMutation.isPending} onClick={() => calcularMutation.mutate()}>
              <Calculator size={15} />{calcularMutation.isPending ? "Calculando..." : `Calcular disposición (${seleccionados.length})`}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="py-14 text-center text-sm text-[var(--text-secondary)]">Cargando evaluaciones...</div> :
          isError ? <div className="py-14 text-center text-sm text-red-600">No se pudieron cargar las evaluaciones pendientes.</div> :
          data.length === 0 ? <div className="flex flex-col items-center gap-2 py-14 text-center text-sm text-[var(--text-secondary)]"><CheckCircle2 className="text-emerald-600" /><span>No hay evaluaciones pendientes de consolidación.</span></div> :
          <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-[11px] uppercase tracking-[.08em] text-[var(--text-secondary)]"><tr>
              <th className="px-5 py-3 w-12"></th><th className="px-5 py-3">Lote / producto</th><th className="px-5 py-3">Evaluación</th><th className="px-5 py-3">Resultados</th><th className="px-5 py-3">Precalculo</th><th className="px-5 py-3">Finalizada</th><th className="px-5 py-3 text-right">Acción</th>
            </tr></thead>
            <tbody>{data.map(item => <tr key={item.evaluacionId} className="border-t border-[var(--border)]">
              <td className="px-5 py-4"><input type="checkbox" className="h-4 w-4" checked={seleccionados.includes(item.evaluacionId)} onChange={() => { setSeleccionados(v => v.includes(item.evaluacionId) ? v.filter(id => id !== item.evaluacionId) : [...v, item.evaluacionId]); setPreview(null); }} /></td>
              <td className="px-5 py-4"><p className="font-semibold">{item.codigoLote}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoCodigo} · {item.productoDescripcion}</p></td>
              <td className="px-5 py-4"><p className="font-medium">Evaluación #{item.evaluacionId}</p><p className="text-xs text-[var(--text-secondary)]">Intento {item.intento} · {item.usuarioEvaluador ?? "—"}</p></td>
              <td className="px-5 py-4"><p className="font-semibold">{item.resultadosRegistrados}/{item.totalParametros}</p><p className="text-xs text-[var(--text-secondary)]">{item.parametrosNoCumplen} fuera de especificación</p></td>
              <td className="px-5 py-4"><Badge variant="outline" className={badge(item.precalculo)}>{item.precalculo.replaceAll("_", " ")}</Badge></td>
              <td className="px-5 py-4 text-[var(--text-secondary)]">{fecha(item.fechaFin)}</td>
              <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={() => navigate(`/operacion/evaluaciones/${item.evaluacionId}`)}><Eye size={14}/>Revisar</Button></td>
            </tr>)}</tbody>
          </table></div>}
        </CardContent>
      </Card>

      {calcularMutation.isError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">No se pudo calcular la disposición.</div>}

      {preview && <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardHeader className="border-b border-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><CardTitle className="text-base">Vista previa de disposición</CardTitle><p className="mt-1 text-xs text-[var(--text-secondary)]">La vista previa no modifica el lote. Guardar vuelve a validar los datos en servidor.</p></div>
            <div className="flex gap-2"><Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{resumen.cumple} cumplen</Badge><Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">{resumen.noCumple} no cumplen</Badge>{resumen.incompleto > 0 && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{resumen.incompleto} incompletas</Badge>}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {preview.evaluaciones.map(item => {
            const detalle = preview.detalle.filter(x => x.evaluacionId === item.evaluacionId);
            const fuera = detalle.filter(x => x.estadoResultado === "NO_CUMPLE");
            return <div key={item.evaluacionId} className="rounded-xl border border-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div><p className="font-semibold">{item.codigoLote} · {item.productoCodigo}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoDescripcion}</p></div>
                <div className="flex items-center gap-2"><Badge variant="outline" className={badge(item.precalculo)}>{item.precalculo.replaceAll("_", " ")}</Badge><span className="text-sm font-semibold">{item.accionPropuesta.replaceAll("_", " ")}</span><Button variant="ghost" size="sm" onClick={() => navigate(`/operacion/evaluaciones/${item.evaluacionId}`)}>Revisar</Button></div>
              </div>
              {fuera.length > 0 && <div className="border-t border-red-100 bg-red-50/60 px-4 py-3"><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-red-700"><AlertTriangle size={14}/>Parámetros fuera de especificación</p><div className="flex flex-wrap gap-2">{fuera.map(x => <span key={x.versCaractId} className="rounded-md bg-white px-2 py-1 text-xs text-red-700">{x.caracteristicaDescripcion}: {x.resultadoNumerico ?? x.resultadoTexto ?? "—"} / {x.especificacion ?? "—"}</span>)}</div></div>}
            </div>;
          })}

          <div className="flex justify-end border-t border-[var(--border)] pt-4">
            <Button
              disabled={guardarMutation.isPending || preview.evaluaciones.filter(x => x.esCalculable && x.precalculo === "CUMPLE").length === 0}
              onClick={() => guardarMutation.mutate()}
            ><Save size={15}/>{guardarMutation.isPending ? "Guardando..." : `Guardar y liberar (${preview.evaluaciones.filter(x => x.esCalculable && x.precalculo === "CUMPLE").length})`}</Button>
          </div>
          {guardarMutation.isError && <p className="text-right text-sm text-red-600">No se pudo completar la consolidación.</p>}
        </CardContent>
      </Card>}
    </PageContainer>
  );
}
