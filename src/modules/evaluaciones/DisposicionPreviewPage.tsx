import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Eye, Save } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { consolidarEvaluaciones } from "./api";
import type { PrecalculoEvaluacionesResponse } from "./types";

type Filtro = "TODOS" | "CUMPLE" | "NO_CUMPLE";

function badge(resultado: string) {
  if (resultado === "CUMPLE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (resultado === "NO_CUMPLE") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function DisposicionPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { tienePermiso } = useAuth();
  const preview = (location.state as { preview?: PrecalculoEvaluacionesResponse } | null)?.preview;
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  const items = preview?.evaluaciones ?? [];
  const visibles = useMemo(() => items.filter(x => filtro === "TODOS" || x.precalculo === filtro), [items, filtro]);
  const cumplen = items.filter(x => x.precalculo === "CUMPLE").length;
  const noCumplen = items.filter(x => x.precalculo === "NO_CUMPLE").length;
  const liberables = items.filter(x => x.esCalculable && x.precalculo === "CUMPLE");

  const guardar = useMutation({
    mutationFn: () => consolidarEvaluaciones(liberables.map(x => x.evaluacionId)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["evaluaciones", "pendientes-calculo"] }),
        queryClient.invalidateQueries({ queryKey: ["evaluaciones", "mi-panel"] }),
        queryClient.invalidateQueries({ queryKey: ["lotes"] }),
      ]);
      navigate("/operacion/evaluaciones", { replace: true });
    },
  });

  if (!tienePermiso("EVALUACION.CONSOLIDAR")) return <Navigate to="/operacion/evaluaciones" replace />;
  if (!preview) return <Navigate to="/operacion/evaluaciones" replace />;

  return <PageContainer className="space-y-5">
    <PageHeader eyebrow="Operación · Calidad · Disposición" title="Resultado del cálculo de disposición" description="Revisa el resultado antes de guardar. Los lotes no conformes permanecen para revisión y decisión de Calidad." actions={<Button variant="outline" onClick={() => navigate("/operacion/evaluaciones")}><ArrowLeft size={15}/>Volver a pendientes</Button>} />

    <section className="grid gap-3 sm:grid-cols-3">
      <Card><CardContent className="p-4"><p className="text-xs text-[var(--text-secondary)]">Seleccionados</p><p className="text-2xl font-semibold">{items.length}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-[var(--text-secondary)]">Cumplen</p><p className="text-2xl font-semibold text-emerald-700">{cumplen}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-[var(--text-secondary)]">No cumplen</p><p className="text-2xl font-semibold text-red-700">{noCumplen}</p></CardContent></Card>
    </section>

    <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
      <CardHeader className="gap-4 border-b border-[var(--border)] lg:flex-row lg:items-center lg:justify-between">
        <div><CardTitle className="text-base">Vista previa de disposición</CardTitle><p className="mt-1 text-xs text-[var(--text-secondary)]">Guardar vuelve a validar los resultados en el servidor.</p></div>
        <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1">
          {([["TODOS","Todos",items.length],["CUMPLE","Cumplen",cumplen],["NO_CUMPLE","No cumplen",noCumplen]] as const).map(([key,label,count]) =>
            <button key={key} type="button" onClick={() => setFiltro(key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${filtro === key ? "bg-white shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{label} <span className={key === "CUMPLE" ? "text-emerald-700" : key === "NO_CUMPLE" ? "text-red-700" : ""}>{count}</span></button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {!visibles.length ? <div className="py-12 text-center text-sm text-[var(--text-secondary)]">No hay resultados para este filtro.</div> :
        visibles.map(item => {
          const detalle = preview.detalle.filter(x => x.evaluacionId === item.evaluacionId);
          const fuera = detalle.filter(x => x.estadoResultado === "NO_CUMPLE");
          return <div key={item.evaluacionId} className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div><p className="font-semibold">{item.codigoLote} · {item.productoCodigo}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoDescripcion} · Evaluación #{item.evaluacionId}</p></div>
              <div className="flex items-center gap-2"><Badge variant="outline" className={badge(item.precalculo)}>{item.precalculo.replaceAll("_"," ")}</Badge><span className="text-sm font-semibold">{item.accionPropuesta.replaceAll("_"," ")}</span><Button variant="outline" size="sm" onClick={() => navigate(`/operacion/evaluaciones/${item.evaluacionId}`)}><Eye size={14}/>Revisar</Button></div>
            </div>
            {fuera.length > 0 && <div className="border-t border-red-100 bg-red-50/60 px-4 py-3"><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-red-700"><AlertTriangle size={14}/>Fuera de especificación</p><div className="flex flex-wrap gap-2">{fuera.map(x => <span key={x.versCaractId} className="rounded-md bg-white px-2 py-1 text-xs text-red-700">{x.caracteristicaDescripcion}: {x.resultadoNumerico ?? x.resultadoTexto ?? "—"} / {x.especificacion ?? "—"}</span>)}</div></div>}
          </div>;
        })}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--text-secondary)]">{noCumplen > 0 ? `${noCumplen} evaluación(es) no conforme(s) no serán liberadas.` : "Todos los resultados seleccionados cumplen."}</p>
          <Button disabled={guardar.isPending || liberables.length === 0} onClick={() => guardar.mutate()}><Save size={15}/>{guardar.isPending ? "Guardando..." : `Guardar y liberar (${liberables.length})`}</Button>
        </div>
        {guardar.isError && <p className="text-right text-sm text-red-600">No se pudo completar la consolidación.</p>}
      </CardContent>
    </Card>
  </PageContainer>;
}
