import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calculator, CheckCircle2, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { listarEvaluacionesPendientesCalculo, precalcularDisposicion } from "./api";

function fecha(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
function badge(resultado: string) {
  if (resultado === "CUMPLE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (resultado === "NO_CUMPLE") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}
type Filtro = "TODOS" | "CUMPLE" | "NO_CUMPLE";

export default function ConsolidacionCalidadPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["evaluaciones", "pendientes-calculo"],
    queryFn: listarEvaluacionesPendientesCalculo,
    enabled: tienePermiso("EVALUACION.CONSOLIDAR"),
  });

  const visibles = useMemo(() => data.filter(x => filtro === "TODOS" || x.precalculo === filtro), [data, filtro]);
  const cumplen = data.filter(x => x.precalculo === "CUMPLE").length;
  const noCumplen = data.filter(x => x.precalculo === "NO_CUMPLE").length;
  const todosVisibles = visibles.length > 0 && visibles.every(x => seleccionados.includes(x.evaluacionId));

  const calcular = useMutation({
    mutationFn: () => precalcularDisposicion(seleccionados),
    onSuccess: response => navigate("/operacion/evaluaciones/disposicion", { state: { preview: response } }),
  });

  if (!tienePermiso("EVALUACION.CONSOLIDAR")) return <PageContainer><div className="py-20 text-center text-sm text-red-600">No tienes permiso para consolidar evaluaciones.</div></PageContainer>;

  return <PageContainer className="space-y-5">
    <PageHeader eyebrow="Operación · Calidad" title="Pendientes de decisión" description="Selecciona las evaluaciones terminadas que deseas calcular y revisar antes de consolidar." actions={<Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw size={15} className={isFetching ? "animate-spin" : ""}/>Actualizar</Button>} />

    <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
      <CardHeader className="gap-4 border-b border-[var(--border)] lg:flex-row lg:items-center lg:justify-between">
        <div><CardTitle className="text-base">Evaluaciones terminadas</CardTitle><p className="mt-1 text-xs text-[var(--text-secondary)]">{data.length} pendiente(s) de consolidación.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1">
            {([["TODOS","Todos",data.length],["CUMPLE","Cumplen",cumplen],["NO_CUMPLE","No cumplen",noCumplen]] as const).map(([key,label,count]) =>
              <button key={key} type="button" onClick={() => setFiltro(key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${filtro === key ? "bg-white shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{label} <span className={key === "CUMPLE" ? "text-emerald-700" : key === "NO_CUMPLE" ? "text-red-700" : ""}>{count}</span></button>
            )}
          </div>
          <Button variant="outline" disabled={!visibles.length} onClick={() => {
            const ids = visibles.map(x => x.evaluacionId);
            setSeleccionados(v => todosVisibles ? v.filter(id => !ids.includes(id)) : Array.from(new Set([...v,...ids])));
          }}>{todosVisibles ? "Quitar selección" : "Seleccionar visibles"}</Button>
          <Button disabled={!seleccionados.length || calcular.isPending} onClick={() => calcular.mutate()}><Calculator size={15}/>{calcular.isPending ? "Calculando..." : `Calcular disposición (${seleccionados.length})`}</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="py-14 text-center text-sm text-[var(--text-secondary)]">Cargando...</div> :
        isError ? <div className="py-14 text-center text-sm text-red-600">No se pudo cargar la cola.</div> :
        !data.length ? <div className="flex flex-col items-center gap-2 py-14 text-sm text-[var(--text-secondary)]"><CheckCircle2 className="text-emerald-600"/>No hay evaluaciones pendientes.</div> :
        !visibles.length ? <div className="py-14 text-center text-sm text-[var(--text-secondary)]">No hay evaluaciones para este filtro.</div> :
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-[11px] uppercase tracking-[.08em] text-[var(--text-secondary)]"><tr><th className="w-12 px-5 py-3"></th><th className="px-5 py-3">Lote / producto</th><th className="px-5 py-3">Evaluación</th><th className="px-5 py-3">Resultados</th><th className="px-5 py-3">Precalculo</th><th className="px-5 py-3">Finalizada</th><th className="px-5 py-3 text-right">Acción</th></tr></thead>
          <tbody>{visibles.map(item => <tr key={item.evaluacionId} className="border-t border-[var(--border)]">
            <td className="px-5 py-4"><input type="checkbox" className="h-4 w-4" checked={seleccionados.includes(item.evaluacionId)} onChange={() => setSeleccionados(v => v.includes(item.evaluacionId) ? v.filter(id => id !== item.evaluacionId) : [...v,item.evaluacionId])}/></td>
            <td className="px-5 py-4"><p className="font-semibold">{item.codigoLote}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoCodigo} · {item.productoDescripcion}</p></td>
            <td className="px-5 py-4"><p className="font-medium">Evaluación #{item.evaluacionId}</p><p className="text-xs text-[var(--text-secondary)]">Intento {item.intento} · {item.usuarioEvaluador ?? "—"}</p></td>
            <td className="px-5 py-4"><p className="font-semibold">{item.resultadosRegistrados}/{item.totalParametros}</p><p className="text-xs text-[var(--text-secondary)]">{item.parametrosNoCumplen} fuera de especificación</p></td>
            <td className="px-5 py-4"><Badge variant="outline" className={badge(item.precalculo)}>{item.precalculo.replaceAll("_"," ")}</Badge></td>
            <td className="px-5 py-4 text-[var(--text-secondary)]">{fecha(item.fechaFin)}</td>
            <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={() => navigate(`/operacion/evaluaciones/${item.evaluacionId}`)}><Eye size={14}/>Revisar</Button></td>
          </tr>)}</tbody>
        </table></div>}
      </CardContent>
    </Card>
    {calcular.isError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">No se pudo calcular la disposición.</div>}
  </PageContainer>;
}
