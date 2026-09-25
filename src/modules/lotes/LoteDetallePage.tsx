import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, ClipboardCheck, Eye, PackageCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerDetalleLote } from "./api";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function badgeClass(codigo?: string | null) {
  if (codigo === "LIBERADO" || codigo === "TERMINADA" || codigo === "CONFORME") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (codigo === "NO_CONFORME" || codigo === "ANULADA") return "border-red-200 bg-red-50 text-red-700";
  if (codigo === "EVALUACION" || codigo === "EN_PROCESO") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function LoteDetallePage() {
  const navigate = useNavigate();
  const { loteId } = useParams();
  const id = Number(loteId);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lote-detalle", id],
    queryFn: () => obtenerDetalleLote(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  if (isLoading) return <PageContainer><div className="py-16 text-center text-[var(--text-secondary)]">Cargando detalle del lote...</div></PageContainer>;
  if (isError || !data?.lote) return <PageContainer><div className="py-16 text-center text-red-600">No se pudo obtener el detalle del lote.</div></PageContainer>;

  const { lote, evaluaciones, resumen } = data;
  const avance = Number(lote.porcentajeAvance ?? 0);

  return (
    <PageContainer className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/operacion/lotes")}><ArrowLeft size={16}/>Volver a lotes</Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--text)]">Lote {lote.codigoLote}</h1>
            <Badge variant="outline" className={badgeClass(lote.estadoLoteCodigo)}>{lote.estadoLoteDescripcion}</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{lote.productoCodigo} · {lote.productoDescripcion}</p>
        </div>
        <div className="text-right text-xs text-[var(--text-secondary)]">
          <div>Producción</div><div className="mt-1 font-medium text-[var(--text)]">{formatDate(lote.fechaHoraProduccion)}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <Card><CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2"><PackageCheck size={18}/><h2 className="font-semibold">Información del lote</h2></div>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Producto" value={lote.productoCodigo} detail={lote.productoDescripcion}/>
            <Info label="Naturaleza" value={lote.naturalezaCodigo} detail={lote.naturalezaDescripcion}/>
            <Info label="Fase" value={lote.faseCodigo} detail={lote.faseDescripcion}/>
            <Info label="Línea" value={lote.lineaOrigenCodigo} detail={lote.lineaOrigenDescripcion}/>
            <Info label="Versión ET" value={String(lote.versionNumero)}/>
            <Info label="Observación" value={lote.observacion || "—"}/>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--text-secondary)]">Avance general</p><p className="mt-1 text-3xl font-semibold">{avance.toFixed(0)}%</p></div><ClipboardCheck size={26} className="text-[var(--primary)]"/></div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{width:`${Math.min(100,Math.max(0,avance))}%`}}/></div>
          <div className="mt-3 flex justify-between text-xs text-[var(--text-secondary)]"><span>{lote.resultadosRegistrados}/{lote.totalParametrosEvaluacion} resultados</span><span>{lote.parametrosPendientes} pendientes</span></div>
        </CardContent></Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Evaluaciones" value={resumen.totalEvaluaciones}/>
        <Metric label="Terminadas" value={resumen.evaluacionesTerminadas}/>
        <Metric label="Conformes / No conformes" value={`${resumen.evaluacionesConformes} / ${resumen.evaluacionesNoConformes}`}/>
      </div>

      <Card className="overflow-hidden"><CardContent className="p-0">
        <div className="border-b border-[var(--border)] px-5 py-4"><h2 className="font-semibold">Historial de evaluaciones</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Evaluaciones registradas para este lote.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[var(--surface-muted)] text-left text-xs uppercase tracking-[.08em] text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Evaluación</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Resultado</th><th className="px-5 py-3">Avance</th><th className="px-5 py-3">Evaluador</th><th className="px-5 py-3">Fechas</th><th className="px-5 py-3 text-right">Acción</th></tr></thead>
          <tbody>{evaluaciones.length === 0 ? <tr><td colSpan={7} className="px-5 py-10 text-center text-[var(--text-secondary)]">Este lote todavía no tiene evaluaciones.</td></tr> : evaluaciones.map(e => <tr key={e.evaluacionId} className="border-t border-[var(--border)]">
            <td className="px-5 py-4"><div className="font-semibold">{e.tipoEvaluacionCodigo} · Intento {e.intento}</div><div className="mt-1 text-xs text-[var(--text-secondary)]">{e.tipoEvaluacionDescripcion} · ID {e.evaluacionId}</div></td>
            <td className="px-5 py-4"><Badge variant="outline" className={badgeClass(e.estadoEvaluacionCodigo)}>{e.estadoEvaluacionCodigo.replaceAll("_"," ")}</Badge></td>
            <td className="px-5 py-4"><Badge variant="outline" className={badgeClass(e.resultadoDescripcion)}>{e.resultadoDescripcion}</Badge></td>
            <td className="px-5 py-4"><div className="w-36"><div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{Number(e.porcentajeAvance).toFixed(0)}%</span><span className="text-[var(--text-secondary)]">{e.resultadosRegistrados}/{e.totalParametros}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{width:`${Math.min(100,Number(e.porcentajeAvance))}%`}}/></div></div></td>
            <td className="px-5 py-4">{e.usuarioEvaluador || "—"}</td>
            <td className="px-5 py-4 text-xs"><div>{formatDate(e.fechaInicio)}</div><div className="mt-1 text-[var(--text-secondary)]">{e.fechaFin ? `Fin: ${formatDate(e.fechaFin)}` : "En curso"}</div></td>
            <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={() => navigate(`/operacion/evaluaciones/${e.evaluacionId}`)}><Eye size={15}/>Ver evaluación<ChevronRight size={14}/></Button></td>
          </tr>)}</tbody>
        </table></div>
      </CardContent></Card>
    </PageContainer>
  );
}

function Info({label,value,detail}:{label:string;value:string;detail?:string}) { return <div><p className="text-xs text-[var(--text-secondary)]">{label}</p><p className="mt-1 font-medium">{value}</p>{detail && <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{detail}</p>}</div>; }
function Metric({label,value}:{label:string;value:number|string}) { return <Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-[.1em] text-[var(--text-secondary)]">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></CardContent></Card>; }
