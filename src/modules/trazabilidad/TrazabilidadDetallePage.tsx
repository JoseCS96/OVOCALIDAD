import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Factory,
  FlaskConical,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import { obtenerTrazabilidadLote } from "./api";
import type { TrazabilidadEvaluacion, TrazabilidadLote } from "./types";

const fecha = (v?: string | null) =>
  v ? new Date(v).toLocaleString("es-PE") : "—";

const valor = (r: TrazabilidadLote["resultados"][number]) =>
  r.resultadoNumerico !== null
    ? `${r.resultadoNumerico}${r.unidadDeMedida ? ` ${r.unidadDeMedida}` : ""}`
    : r.resultadoTexto || "—";

const especificacion = (r: TrazabilidadLote["resultados"][number]) => {
  switch (r.tipoCriterio) {
    case "RANGO":
      return `${r.valorCuantitativoInicial} – ${r.valorCuantitativoFinal} ${r.unidadDeMedida || ""}`;
    case "MINIMO":
      return `≥ ${r.valorCuantitativoInicial} ${r.unidadDeMedida || ""}`;
    case "MAXIMO":
      return `≤ ${r.valorCuantitativoFinal} ${r.unidadDeMedida || ""}`;
    case "MAYOR_QUE":
      return `> ${r.valorCuantitativoInicial} ${r.unidadDeMedida || ""}`;
    case "MENOR_QUE":
      return `< ${r.valorCuantitativoFinal} ${r.unidadDeMedida || ""}`;
    case "IGUAL":
      return `= ${r.valorCuantitativoIgual} ${r.unidadDeMedida || ""}`;
    default:
      return r.valorCualitativo || "—";
  }
};

const referenciaEtapa = (codigo?: string | null, fallback?: string | null) => {
  const valor = codigo?.trim();
  return valor && valor !== "." ? valor : fallback || "Producto";
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
    if (!Number.isInteger(id) || id <= 0) {
      setError("Lote inválido.");
      return;
    }
    setLoading(true);
    setError("");
    obtenerTrazabilidadLote(id)
      .then(setData)
      .catch(() => setError("No fue posible obtener la trazabilidad del lote."))
      .finally(() => setLoading(false));
  }, [loteId]);

  const evaluacionesPorEtapa = useMemo(() => {
    const map = new Map<number, TrazabilidadEvaluacion[]>();
    data?.evaluaciones.forEach((e) => {
      if (!e.versionFaseId) return;
      map.set(e.versionFaseId, [...(map.get(e.versionFaseId) || []), e]);
    });
    return map;
  }, [data]);

  const toggle = (id: number) =>
    setAbiertas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const noConformes =
    data?.evaluaciones.filter((e) => e.resultadoGeneral === false).length ?? 0;
  const reevaluaciones =
    data?.evaluaciones.filter((e) => e.evaluacionPadreId !== null).length ?? 0;
  const resultadosNC =
    data?.resultados.filter((r) => r.cumple === false).length ?? 0;

  const inicio = data?.lote.audFechaCreacion
    ? new Date(data.lote.audFechaCreacion).getTime()
    : 0;
  const fin = data?.lote.audFechaActualizacion
    ? new Date(data.lote.audFechaActualizacion).getTime()
    : inicio;
  const duracionMin = inicio && fin ? Math.max(0, Math.round((fin - inicio) / 60000)) : 0;

  return (
    <PageContainer className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Sistema · Trazabilidad
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Historia del lote</h1>
        <p className="text-sm text-slate-500">
          Del ingreso a control de calidad hasta su condición final, con evidencia de cada intento.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/trazabilidad")}
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:underline"
        >
          <ArrowLeft size={16} /> Volver al listado
        </button>
        {loading && <span className="text-sm text-slate-500">Cargando trazabilidad...</span>}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {data && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lote</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{data.lote.codigoLote}</h2>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {data.lote.estadoLoteDescripcion}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {data.lote.productoCodigo} · {data.lote.productoDescripcion}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>ET aplicada</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {data.lote.documentoCodigo} · V{data.lote.versionNumero}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-4">
              <div><p className="text-xs text-slate-400">Código Génesis</p><p className="font-medium">{data.lote.codigoGenesis || "—"}</p></div>
              <div><p className="text-xs text-slate-400">Producción</p><p className="font-medium">{fecha(data.lote.fechaHoraProduccion)}</p></div>
              <div><p className="text-xs text-slate-400">Creado por</p><p className="font-medium">{data.lote.audUsuarioCreacion || "—"}</p></div>
              <div><p className="text-xs text-slate-400">Última actividad</p><p className="font-medium">{fecha(data.lote.audFechaActualizacion || data.lote.audFechaCreacion)}</p></div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Etapas</span><FlaskConical size={18} className="text-sky-700" /></div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.etapas.length}</p>
              <p className="mt-1 text-xs text-slate-500">{data.etapas.filter((x) => x.esObligatoria).length} obligatorias</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intentos</span><Activity size={18} className="text-sky-700" /></div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.evaluaciones.length}</p>
              <p className="mt-1 text-xs text-slate-500">{reevaluaciones} reevaluación(es)</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Desviaciones</span><AlertTriangle size={18} className={noConformes ? "text-amber-600" : "text-emerald-600"} /></div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{noConformes}</p>
              <p className="mt-1 text-xs text-slate-500">{resultadosNC} resultado(s) fuera de especificación</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tiempo de ciclo</span><Clock3 size={18} className="text-sky-700" /></div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{duracionMin}<span className="ml-1 text-base font-medium text-slate-500">min</span></p>
              <p className="mt-1 text-xs text-slate-500">Creación → última actividad</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Historia del proceso</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Cómo llegó el lote a su estado actual</h3>
              <p className="mt-1 text-sm text-slate-500">La secuencia muestra etapas, intentos y desviaciones hasta el resultado final.</p>
            </div>

            <div className="mt-6 flex flex-col items-stretch gap-2">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Factory size={19} className="text-sky-700" />
                <div><p className="font-semibold text-slate-900">Creación del lote</p><p className="text-xs text-slate-500">{fecha(data.lote.audFechaCreacion)} · {data.lote.audUsuarioCreacion || "—"}</p></div>
              </div>

              {data.etapas.map((etapa) => {
                const evs = evaluacionesPorEtapa.get(etapa.versionFaseId) || [];
                return (
                  <div key={etapa.versionFaseId} className="space-y-2">
                    <div className="flex justify-center"><ArrowDown size={18} className="text-slate-300" /></div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-sky-700">Etapa {etapa.orden}</span>
                            {etapa.esFinal && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">FINAL</span>}
                          </div>
                          <p className="mt-1 text-lg font-semibold">{referenciaEtapa(etapa.codigoReferencia, data.lote.productoCodigo)}</p>
                          <p className="text-sm text-slate-500">{etapa.faseCodigo} · {etapa.faseDescripcion} · {etapa.cantidadCaracteristicas} características</p>
                        </div>
                        <span className="text-xs text-slate-500">{evs.length} intento(s)</span>
                      </div>

                      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {evs.map((e) => (
                          <div key={e.evaluacionId} className={"rounded-xl border p-3 " + (e.resultadoGeneral === false ? "border-red-200 bg-red-50/60" : e.resultadoGeneral === true ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60")}>
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-slate-900">Intento {e.intento}</p>
                              {e.resultadoGeneral === false ? <XCircle size={17} className="text-red-600" /> : e.resultadoGeneral === true ? <CheckCircle2 size={17} className="text-emerald-600" /> : <Clock3 size={17} className="text-amber-600" />}
                            </div>
                            <p className={"mt-1 text-xs font-semibold " + (e.resultadoGeneral === false ? "text-red-700" : e.resultadoGeneral === true ? "text-emerald-700" : "text-amber-700")}>{e.resultadoDescripcion}</p>
                            {e.evaluacionPadreId && <p className="mt-1 text-[11px] text-amber-700">Reevaluación del intento {data.evaluaciones.find((x) => x.evaluacionId === e.evaluacionPadreId)?.intento ?? e.evaluacionPadreId}</p>}
                            <p className="mt-2 text-[11px] text-slate-500">{e.usuarioEvaluador || "Sin evaluador"} · {fecha(e.fechaFin || e.fechaInicio)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-center"><ArrowDown size={18} className="text-slate-300" /></div>
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 size={20} className="text-emerald-700" />
                <div><p className="font-semibold text-emerald-900">{data.lote.estadoLoteDescripcion}</p><p className="text-xs text-emerald-700">Estado actual del lote · {fecha(data.lote.audFechaActualizacion || data.lote.audFechaCreacion)}</p></div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Evidencia técnica</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Evaluaciones y resultados</h3>
            <p className="mt-1 text-sm text-slate-500">Abre un intento para revisar exactamente qué se evaluó, contra qué especificación y cuál fue el resultado.</p>

            <div className="mt-4 space-y-3">
              {data.evaluaciones.map((e) => {
                const rs = data.resultados.filter((r) => r.evaluacionId === e.evaluacionId);
                const open = abiertas.has(e.evaluacionId);
                const fallidos = rs.filter((r) => r.cumple === false).length;
                return (
                  <div key={e.evaluacionId} className="overflow-hidden rounded-xl border border-slate-200">
                    <button onClick={() => toggle(e.evaluacionId)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
                      {open ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">Intento {e.intento} · {referenciaEtapa(e.codigoReferencia, data.lote.productoCodigo)}</span>
                          {e.evaluacionPadreId && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Reevaluación</span>}
                          {fallidos > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">{fallidos} fuera de especificación</span>}
                        </div>
                        <p className="text-xs text-slate-500">{e.usuarioEvaluador || "Sin evaluador"} · {fecha(e.fechaInicio)} → {fecha(e.fechaFin)}</p>
                      </div>
                      <span className={"text-xs font-semibold " + (e.resultadoGeneral === false ? "text-red-600" : e.resultadoGeneral === true ? "text-emerald-700" : "text-amber-700")}>{e.resultadoDescripcion}</span>
                    </button>

                    {open && (
                      <div className="border-t border-slate-200 bg-slate-50/50 p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead><tr className="text-left text-xs text-slate-500"><th className="pb-2">Característica</th><th className="pb-2">Especificación</th><th className="pb-2">Resultado</th><th className="pb-2">Cumple</th><th className="pb-2">Auditoría</th></tr></thead>
                            <tbody>
                              {rs.map((r) => (
                                <tr key={r.evaluacionResultadoId} className={r.cumple === false ? "border-t border-red-100 bg-red-50/60" : "border-t border-slate-200"}>
                                  <td className="py-2 font-medium">{r.caracteristica}</td>
                                  <td className="py-2">{especificacion(r)}</td>
                                  <td className="py-2">{valor(r)}</td>
                                  <td className="py-2">{r.cumple === true ? <span className="font-semibold text-emerald-700">Cumple</span> : r.cumple === false ? <span className="font-semibold text-red-700">No cumple</span> : "—"}</td>
                                  <td className="py-2 text-xs text-slate-500">{r.audUsuarioCreacion || "—"}<br />{fecha(r.fechaResultado)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-sky-700" /><h3 className="font-semibold">Auditoría y estados</h3></div>
            {data.historialEstados.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Este lote es anterior a la instalación del historial de estados. Las evaluaciones y sus resultados sí conservan su evidencia histórica.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {data.historialEstados.map((h) => (
                  <div key={h.loteHistorialEstadoId} className="flex gap-3">
                    <div className="mt-1"><CheckCircle2 size={18} className="text-emerald-600" /></div>
                    <div>
                      <p className="font-medium">{h.accion.replaceAll("_", " ")}</p>
                      <p className="text-sm text-slate-600">{h.estadoOrigen || "SIN ESTADO"} → <b>{h.estadoDestino}</b></p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400"><span className="inline-flex items-center gap-1"><UserRound size={12} />{h.usuario}</span><span>{fecha(h.fecha)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
