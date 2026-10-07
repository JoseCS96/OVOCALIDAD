import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Activity, CheckCircle2, ChevronDown, ChevronRight, ShieldCheck, UserRound } from "lucide-react";
import { obtenerTrazabilidadLote } from "./api";
import type { TrazabilidadEvaluacion, TrazabilidadLote } from "./types";

const fecha = (v?: string | null) => v ? new Date(v).toLocaleString("es-PE") : "—";
const valor = (r: TrazabilidadLote["resultados"][number]) =>
  r.resultadoNumerico !== null ? `${r.resultadoNumerico}${r.unidadDeMedida ? ` ${r.unidadDeMedida}` : ""}` : (r.resultadoTexto || "—");
const especificacion = (r: TrazabilidadLote["resultados"][number]) => {
  switch (r.tipoCriterio) {
    case "RANGO": return `${r.valorCuantitativoInicial} – ${r.valorCuantitativoFinal} ${r.unidadDeMedida || ""}`;
    case "MINIMO": return `≥ ${r.valorCuantitativoInicial} ${r.unidadDeMedida || ""}`;
    case "MAXIMO": return `≤ ${r.valorCuantitativoFinal} ${r.unidadDeMedida || ""}`;
    case "MAYOR_QUE": return `> ${r.valorCuantitativoInicial} ${r.unidadDeMedida || ""}`;
    case "MENOR_QUE": return `< ${r.valorCuantitativoFinal} ${r.unidadDeMedida || ""}`;
    case "IGUAL": return `= ${r.valorCuantitativoIgual} ${r.unidadDeMedida || ""}`;
    default: return r.valorCualitativo || "—";
  }
};

export default function TrazabilidadDetallePage() {
  const { loteId = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<TrazabilidadLote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [abiertas, setAbiertas] = useState<Set<number>>(new Set());

  useEffect(() => {
    const id = Number(loteId);
    if (!Number.isInteger(id) || id <= 0) { setError("Lote inválido."); return; }
    setLoading(true); setError("");
    obtenerTrazabilidadLote(id).then(setData).catch(() => setError("No fue posible obtener la trazabilidad del lote.")).finally(() => setLoading(false));
  }, [loteId]);

  const evaluacionesPorEtapa = useMemo(() => {
    const map = new Map<number, TrazabilidadEvaluacion[]>();
    data?.evaluaciones.forEach(e => {
      if (!e.versionFaseId) return;
      map.set(e.versionFaseId, [...(map.get(e.versionFaseId) || []), e]);
    });
    return map;
  }, [data]);

  const toggle = (id:number) => setAbiertas(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  return <div className="space-y-6">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Sistema</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Trazabilidad del lote</h1>
      <p className="mt-1 text-sm text-slate-500">Historia completa desde la creación, evaluaciones y reevaluaciones hasta la liberación.</p>
    </div>

    <div className="flex items-center justify-between">
      <button type="button" onClick={() => navigate("/trazabilidad")} className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:underline"><ArrowLeft size={16}/>Volver al listado</button>
      {loading && <span className="text-sm text-slate-500">Cargando trazabilidad...</span>}
    </div>
    {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

    {data && <>
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase text-slate-400">Lote</p><h2 className="text-2xl font-semibold">{data.lote.codigoLote}</h2><p className="mt-1 text-sm text-slate-600">{data.lote.productoDescripcion || data.lote.productoCodigo}</p></div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{data.lote.estadoLoteCodigo}</span>
        </div>
        <div className="mt-5 grid gap-4 border-t pt-4 md:grid-cols-4">
          <div><p className="text-xs text-slate-400">Código Génesis</p><p className="font-medium">{data.lote.codigoGenesis || "—"}</p></div>
          <div><p className="text-xs text-slate-400">Especificación técnica</p><p className="font-medium">{data.lote.documentoCodigo} · V{data.lote.versionNumero}</p></div>
          <div><p className="text-xs text-slate-400">Producción</p><p className="font-medium">{fecha(data.lote.fechaHoraProduccion)}</p></div>
          <div><p className="text-xs text-slate-400">Creado por</p><p className="font-medium">{data.lote.audUsuarioCreacion || "—"}</p></div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Ruta de calidad</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.etapas.map(etapa => {
            const evs=evaluacionesPorEtapa.get(etapa.versionFaseId)||[];
            const ultima=evs.at(-1);
            return <div key={etapa.versionFaseId} className="rounded-xl border p-4">
              <div className="flex justify-between"><span className="text-xs font-semibold text-sky-700">ETAPA {etapa.orden}</span>{etapa.esFinal&&<span className="text-xs font-semibold text-emerald-700">FINAL</span>}</div>
              <p className="mt-1 text-lg font-semibold">{etapa.codigoReferencia}</p><p className="text-sm text-slate-500">{etapa.faseCodigo} · {etapa.faseDescripcion}</p>
              <div className="mt-3 flex justify-between text-xs text-slate-500"><span>{etapa.cantidadCaracteristicas} características</span><span>{evs.length} intento(s)</span></div>
              {ultima&&<p className={"mt-2 text-xs font-semibold "+(ultima.resultadoGeneral===false?"text-red-600":ultima.resultadoGeneral===true?"text-emerald-700":"text-amber-700")}>{ultima.resultadoDescripcion}</p>}
            </div>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Evaluaciones y resultados</h3>
        <div className="mt-4 space-y-3">
          {data.evaluaciones.map(e => {
            const rs=data.resultados.filter(r=>r.evaluacionId===e.evaluacionId);
            const open=abiertas.has(e.evaluacionId);
            return <div key={e.evaluacionId} className="overflow-hidden rounded-xl border">
              <button onClick={()=>toggle(e.evaluacionId)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
                {open?<ChevronDown size={17}/>:<ChevronRight size={17}/>}
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">I{e.intento} · {e.codigoReferencia || "Evaluación"}</span>{e.evaluacionPadreId&&<span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Reevaluación de I{data.evaluaciones.find(x=>x.evaluacionId===e.evaluacionPadreId)?.intento ?? e.evaluacionPadreId}</span>}</div><p className="text-xs text-slate-500">{e.usuarioEvaluador || "Sin evaluador"} · {fecha(e.fechaInicio)} → {fecha(e.fechaFin)}</p></div>
                <span className={"text-xs font-semibold "+(e.resultadoGeneral===false?"text-red-600":e.resultadoGeneral===true?"text-emerald-700":"text-amber-700")}>{e.resultadoDescripcion}</span>
              </button>
              {open&&<div className="border-t bg-slate-50/50 p-4">
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="pb-2">Característica</th><th className="pb-2">Especificación</th><th className="pb-2">Resultado</th><th className="pb-2">Cumple</th><th className="pb-2">Auditoría</th></tr></thead><tbody>{rs.map(r=><tr key={r.evaluacionResultadoId} className="border-t"><td className="py-2 font-medium">{r.caracteristica}</td><td className="py-2">{especificacion(r)}</td><td className="py-2">{valor(r)}</td><td className="py-2">{r.cumple===true?"Sí":r.cumple===false?"No":"—"}</td><td className="py-2 text-xs text-slate-500">{r.audUsuarioCreacion || "—"}<br/>{fecha(r.fechaResultado)}</td></tr>)}</tbody></table></div>
              </div>}
            </div>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Activity size={18}/><h3 className="font-semibold">Historial de estados</h3></div>
        {data.historialEstados.length===0 ? <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-500">Este lote es anterior a la instalación del historial de estados. Sus evaluaciones y resultados sí permanecen disponibles arriba.</div> :
        <div className="mt-4 space-y-4">{data.historialEstados.map(h=><div key={h.loteHistorialEstadoId} className="flex gap-3"><div className="mt-1"><CheckCircle2 size={18} className="text-emerald-600"/></div><div><p className="font-medium">{h.accion.replaceAll("_"," ")}</p><p className="text-sm text-slate-600">{h.estadoOrigen || "SIN ESTADO"} → <b>{h.estadoDestino}</b></p><div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400"><span className="inline-flex items-center gap-1"><UserRound size={12}/>{h.usuario}</span><span>{fecha(h.fecha)}</span></div></div></div>)}</div>}
      </section>

      <section className="rounded-2xl border bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-2"><ShieldCheck size={18}/><h3 className="font-semibold">Resumen de auditoría</h3></div>
        <p className="mt-2 text-sm text-slate-300">{data.evaluaciones.length} evaluaciones/intentos · {data.resultados.length} resultados históricos · {data.historialEstados.length} cambios de estado auditados.</p>
        <p className="mt-1 text-xs text-slate-400">Última modificación del lote: {data.lote.audUsuarioModificacion || data.lote.audUsuarioCreacion || "—"} · {fecha(data.lote.audFechaActualizacion || data.lote.audFechaCreacion)}</p>
      </section>
    </>}
  </div>;
}
