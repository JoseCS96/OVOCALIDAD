import { Fragment, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FlaskConical, PlayCircle, RotateCcw, Save, ShieldCheck, X } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { crearEvaluacion, guardarResultado, iniciarEvaluacion, obtenerEvaluacion, obtenerRutaEvaluacionLote, solicitarReapertura, terminarEvaluacion } from "./api";
import { useAuth } from "@/modules/auth/AuthContext";
import type { EvaluacionDetalle, GuardarResultadoRequest } from "./types";
import { obtenerDetalleLote } from "@/modules/lotes/api";

type Draft = { texto: string; numero: string; cumple: boolean | null; dirty: boolean };
type DraftMap = Record<number, Draft>;

const groupOrder = ["ORGANOLEPTICA", "FISICOQUIMICA", "MICROBIOLOGICA"];

function labelGrupo(value: string) {
  const key = value.toUpperCase();
  if (key === "ORGANOLEPTICA") return "Organolépticas";
  if (key === "FISICOQUIMICA") return "Fisicoquímicas";
  if (key === "MICROBIOLOGICA") return "Microbiológicas";
  return value;
}

function EstadoResultado({ cumple, tieneResultado }: { cumple: boolean | null; tieneResultado: boolean }) {
  if (!tieneResultado) return <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">Pendiente</span>;
  if (cumple === true) return <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">✓ Cumple</span>;
  if (cumple === false) return <span className="inline-flex whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">! No cumple</span>;
  return <span className="inline-flex whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Por definir</span>;
}

function normalizarTexto(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleUpperCase("es-PE");
}

function valorSugerido(item: EvaluacionDetalle): Pick<Draft, "numero" | "texto"> {
  if (item.resultadoNumerico !== null && item.resultadoNumerico !== undefined) return { numero: String(item.resultadoNumerico), texto: "" };
  if (item.resultadoTexto?.trim()) return { numero: "", texto: item.resultadoTexto };

  const criterio = (item.tipoCriterio ?? "").toUpperCase();
  const especificacion = item.especificacion ?? "";
  if (item.tipoResultado === "TEXTO") return { numero: "", texto: especificacion };

  const numeros = especificacion.match(/-?\d+(?:[.,]\d+)?/g)?.map((v) => Number(v.replace(",", "."))) ?? [];
  if (criterio === "RANGO" && numeros.length >= 2) return { numero: String((numeros[0] + numeros[1]) / 2), texto: "" };
  if (["MINIMO", "MAXIMO", "MAYOR_QUE", "MENOR_QUE", "IGUAL"].includes(criterio) && numeros[0] !== undefined) return { numero: String(numeros[0]), texto: "" };
  return { numero: "", texto: "" };
}

function calcularCumpleLocal(item: EvaluacionDetalle, draft: Draft): boolean | null {
  const criterio = (item.tipoCriterio ?? "").toUpperCase();

  if (criterio === "CUALITATIVO" || criterio === "AUSENCIA") {
    if (!draft.texto.trim()) return null;
    return normalizarTexto(draft.texto) === normalizarTexto(item.especificacion);
  }

  if (!draft.numero.trim()) return null;
  const valor = Number(draft.numero);
  if (!Number.isFinite(valor)) return null;

  const especificacion = item.especificacion ?? "";
  const numeros = especificacion.match(/-?\d+(?:[.,]\d+)?/g)?.map((v) => Number(v.replace(",", "."))) ?? [];

  if (criterio === "MINIMO") return numeros[0] !== undefined ? valor >= numeros[0] : null;
  if (criterio === "MAXIMO") return numeros[0] !== undefined ? valor <= numeros[0] : null;
  if (criterio === "RANGO") return numeros.length >= 2 ? valor >= numeros[0] && valor <= numeros[1] : null;
  if (criterio === "MAYOR_QUE") return numeros[0] !== undefined ? valor > numeros[0] : null;
  if (criterio === "MENOR_QUE") return numeros[0] !== undefined ? valor < numeros[0] : null;
  if (criterio === "IGUAL") return numeros[0] !== undefined ? valor === numeros[0] : null;

  return null;
}

function resultadoCambio(item: EvaluacionDetalle, draft: Draft): boolean {
  const criterio = (item.tipoCriterio ?? "").toUpperCase();
  const esTexto = criterio === "AUSENCIA" || criterio === "CUALITATIVO";

  // Si nunca fue evaluada, cualquier valor visible válido debe insertarse.
  if (item.evaluacionResultadoId === null) {
    return esTexto ? draft.texto.trim() !== "" : draft.numero.trim() !== "";
  }

  // Si ya existe, solo se envía cuando el valor realmente cambió.
  if (esTexto) {
    return normalizarTexto(draft.texto) !== normalizarTexto(item.resultadoTexto);
  }

  if (draft.numero.trim() === "") return item.resultadoNumerico !== null;
  const actual = Number(draft.numero);
  const persistido = item.resultadoNumerico;
  if (!Number.isFinite(actual)) return true;
  if (persistido === null || persistido === undefined) return true;
  return Math.abs(actual - Number(persistido)) > 0.000001;
}

function ResultadoControl({ item, draft, onChange, puedeRegistrar }: { item: EvaluacionDetalle; draft: Draft; onChange: (next: Partial<Draft>) => void; puedeRegistrar: boolean }) {
  const criterio = (item.tipoCriterio ?? "").toUpperCase();
  const cumpleLocal = calcularCumpleLocal(item, draft);
  const inputClass = cumpleLocal === true
    ? "border-emerald-300 bg-emerald-50/60 focus-visible:ring-emerald-200"
    : cumpleLocal === false
      ? "border-amber-300 bg-amber-50/70 focus-visible:ring-amber-200"
      : "";

  if (criterio === "AUSENCIA") {
    return (
      <div className="flex min-w-64 items-center gap-2">
        <select
          className={`h-9 min-w-36 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 ${inputClass || "border-[var(--border)] bg-white focus:ring-[var(--ring)]"}`}
          value={draft.texto}
          disabled={!item.permiteEditar || !puedeRegistrar}
          onChange={(e) => onChange({ texto: e.target.value, numero: "", cumple: null, dirty: true })}
        >
          <option value="">Seleccionar</option>
          <option value="Ausencia">Ausencia</option>
          <option value="Presencia">Presencia</option>
        </select>
        <EstadoResultado cumple={cumpleLocal} tieneResultado={draft.texto.trim() !== ""} />
      </div>
    );
  }

  if (criterio === "CUALITATIVO") {
    return (
      <div className="flex min-w-[360px] items-center gap-2">
        <Input
          className={`min-w-0 flex-1 ${inputClass}`}
          value={draft.texto}
          disabled={!item.permiteEditar || !puedeRegistrar}
          placeholder="Registrar resultado"
          onChange={(e) => onChange({ texto: e.target.value, cumple: null, dirty: true })}
        />
        <EstadoResultado cumple={cumpleLocal} tieneResultado={draft.texto.trim() !== ""} />
      </div>
    );
  }

  return (
    <div className="flex min-w-56 items-center gap-2">
      <Input
        type="number"
        step="any"
        className={`min-w-0 flex-1 ${inputClass}`}
        value={draft.numero}
        disabled={!item.permiteEditar || !puedeRegistrar}
        placeholder="0.00"
        onChange={(e) => onChange({ numero: e.target.value, texto: "", cumple: null, dirty: true })}
      />
      <EstadoResultado cumple={cumpleLocal} tieneResultado={draft.numero.trim() !== ""} />
    </div>
  );
}

export default function EvaluacionEnLineaPage() {
  const navigate = useNavigate();
  const { evaluacionId } = useParams();
  const location = useLocation();
  const id = Number(evaluacionId);
  const queryClient = useQueryClient();
  const { tienePermiso } = useAuth();
  const puedeRegistrarResultados = tienePermiso("RESULTADO.REGISTRAR");
  const puedeTerminarEvaluacion = tienePermiso("EVALUACION.TERMINAR");
  const puedeSolicitarReapertura = tienePermiso("EVALUACION.SOLICITAR_REAPERTURA");
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["evaluacion", id],
    queryFn: () => obtenerEvaluacion(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const loteId = data?.cabecera.loteId ?? 0;
  const { data: detalleLote } = useQuery({
    queryKey: ["lote", loteId],
    queryFn: () => obtenerDetalleLote(loteId),
    enabled: loteId > 0,
  });
  const { data: rutaLote } = useQuery({
    queryKey: ["evaluacion-ruta", loteId],
    queryFn: () => obtenerRutaEvaluacionLote(loteId),
    enabled: loteId > 0,
  });

  useEffect(() => {
    if (!data) return;
    const next: DraftMap = {};
    for (const item of data.detalle) {
      const sugerido = valorSugerido(item);
      const tieneResultadoPersistido = item.evaluacionResultadoId !== null;
      next[item.versCaractId] = {
        texto: sugerido.texto,
        numero: sugerido.numero,
        cumple: item.cumple,
        dirty: !tieneResultadoPersistido && (sugerido.numero !== "" || sugerido.texto.trim() !== ""),
      };
    }
    setDrafts(next);
  }, [data]);

  const grupos = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, EvaluacionDetalle[]>();
    for (const item of data.detalle) {
      const key = item.tipoCaracteristica || "OTRAS";
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()].sort(([a], [b]) => {
      const ia = groupOrder.indexOf(a.toUpperCase());
      const ib = groupOrder.indexOf(b.toUpperCase());
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  }, [data]);

  const finishMutation = useMutation({
    mutationFn: () => terminarEvaluacion(id),
    onSuccess: async (response) => {
      setSaveError(null);
      setSavedMessage(response.mensaje);
      await queryClient.invalidateQueries({ queryKey: ["evaluacion", id] });
      await queryClient.invalidateQueries({ queryKey: ["evaluaciones", "mi-panel"] });
      await queryClient.invalidateQueries({ queryKey: ["lotes"] });
      await queryClient.invalidateQueries({ queryKey: ["evaluacion-ruta", loteId] });
    },
    onError: (error) => {
      setSavedMessage(null);
      setSaveError(error instanceof Error ? error.message : "No se pudo terminar la evaluación.");
    },
  });

  const continuarMutation = useMutation({
    mutationFn: async ({ reevaluacion }: { reevaluacion: boolean }) => {
      if (!data) throw new Error("No se encontró la evaluación actual.");
      const creada = await crearEvaluacion({
        loteId: data.cabecera.loteId,
        tipoEvaluacionId: data.cabecera.tipoEvaluacionId,
        evaluacionPadreId: reevaluacion ? data.cabecera.evaluacionId : null,
        motivoReevaluacion: reevaluacion ? "Reevaluación de parámetros no conformes" : null,
        observacion: null,
      });
      if (!creada.evaluacionId) throw new Error("No se recibió el identificador de la nueva evaluación.");
      const iniciada = await iniciarEvaluacion(creada.evaluacionId);
      return { creada, iniciada };
    },
    onSuccess: async ({ creada }) => {
      setSaveError(null);
      setSavedMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["evaluaciones"] });
      await queryClient.invalidateQueries({ queryKey: ["lotes"] });
      await queryClient.invalidateQueries({ queryKey: ["evaluacion-ruta", loteId] });
      if (creada.evaluacionId) navigate(`/operacion/evaluaciones/${creada.evaluacionId}`, { replace: true });
    },
    onError: (error) => {
      setSavedMessage(null);
      setSaveError(error instanceof Error ? error.message : "No se pudo continuar con la evaluación.");
    },
  });

  const reopenMutation = useMutation({
    mutationFn: () => solicitarReapertura(id, reopenReason.trim()),
    onSuccess: async (response) => {
      setSaveError(null);
      setSavedMessage(`${response.mensaje} Solicitud #${response.solicitudReaperturaId}.`);
      setReopenOpen(false);
      setReopenReason("");
      await queryClient.invalidateQueries({ queryKey: ["evaluacion", id] });
    },
    onError: (error) => {
      setSavedMessage(null);
      setSaveError(error instanceof Error ? error.message : "No se pudo solicitar la reapertura.");
    },
  });

  const mutation = useMutation({
    mutationFn: async (items: GuardarResultadoRequest[]) => {
      for (const item of items) await guardarResultado(id, item);
    },
    onSuccess: async () => {
      setSaveError(null);
      setSavedMessage("Avance guardado correctamente.");
      await queryClient.invalidateQueries({ queryKey: ["evaluacion", id] });
    },
    onError: (error) => {
      setSavedMessage(null);
      setSaveError(error instanceof Error ? error.message : "No se pudo guardar el avance.");
    },
  });

  function updateDraft(versCaractId: number, next: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [versCaractId]: { ...(current[versCaractId] ?? { texto: "", numero: "", cumple: null, dirty: false }), ...next },
    }));
  }

  function save() {
    if (!data) return;
    setSaveError(null);
    setSavedMessage(null);
    const requests: GuardarResultadoRequest[] = [];

    for (const item of data.detalle) {
      const draft = drafts[item.versCaractId];
      if (!draft) continue;
      if (!resultadoCambio(item, draft)) continue;
      const criterio = (item.tipoCriterio ?? "").toUpperCase();
      if (["MINIMO", "MAXIMO", "RANGO", "MAYOR_QUE", "MENOR_QUE", "IGUAL"].includes(criterio) && draft.numero === "") {
        setSaveError(`Ingresa un resultado para ${item.caracteristica}.`);
        return;
      }
      if (["AUSENCIA", "CUALITATIVO"].includes(criterio) && !draft.texto.trim()) {
        setSaveError(`Ingresa un resultado para ${item.caracteristica}.`);
        return;
      }
      requests.push({
        versCaractId: item.versCaractId,
        resultadoTexto: ["AUSENCIA", "CUALITATIVO"].includes(criterio) ? draft.texto.trim() : null,
        resultadoNumerico: ["MINIMO", "MAXIMO", "RANGO", "MAYOR_QUE", "MENOR_QUE", "IGUAL"].includes(criterio) ? Number(draft.numero) : null,
        cumple: ["CUALITATIVO", "AUSENCIA"].includes(criterio) ? calcularCumpleLocal(item, draft) : null,
        observacion: null,
      });
    }

    if (requests.length === 0) {
      setSavedMessage("No hay cambios pendientes por guardar.");
      return;
    }
    mutation.mutate(requests);
  }

  function finishEvaluation() {
    if (!data) return;
    const cambiosSinGuardar = data.detalle.some((item) => {
      const draft = drafts[item.versCaractId];
      return draft ? resultadoCambio(item, draft) : false;
    });
    if (cambiosSinGuardar) {
      setSaveError("Hay cambios sin guardar. Guarda el avance antes de terminar para que esos valores formen parte de la evaluación.");
      return;
    }
    if (!window.confirm("¿Terminar evaluación? Se bloquearán exactamente los resultados actualmente guardados. Los parámetros pendientes pueden quedar sin resultado y luego solo podrán corregirse mediante una reapertura autorizada.")) return;
    setSaveError(null);
    setSavedMessage(null);
    finishMutation.mutate();
  }

  function sendReopenRequest() {
    const motivo = reopenReason.trim();
    if (!motivo) {
      setSaveError("Ingresa el motivo de la solicitud de reapertura.");
      return;
    }
    setSaveError(null);
    setSavedMessage(null);
    reopenMutation.mutate();
  }

  if (isLoading) return <PageContainer><div className="py-20 text-center text-[var(--text-secondary)]">Cargando evaluación...</div></PageContainer>;
  if (isError || !data) return <PageContainer><div className="py-20 text-center text-red-600">No se pudo cargar la evaluación.</div></PageContainer>;

  const { cabecera, avance } = data;
  const estaEnProceso = cabecera.estadoEvaluacion === "EN_PROCESO";
  const estaTerminada = cabecera.estadoEvaluacion === "TERMINADA";
  const estadoLoteCodigo = detalleLote?.lote.estadoLoteCodigo?.toUpperCase() ?? "";
  const loteEnEtapaPosterior = ["LIBERADO", "NO_CONFORME", "CERTIFICADO", "ANULADO"].includes(estadoLoteCodigo);
  const esEvaluacionPorEtapa = Boolean(cabecera.versionFaseId);
  const existeEvaluacionEtapaPosterior = Boolean(
    cabecera.versionFaseOrden &&
    rutaLote?.etapas?.some(
      (etapa) =>
        etapa.orden > cabecera.versionFaseOrden! &&
        (etapa.cantidadIntentos > 0 || Boolean(etapa.ultimaEvaluacionId)),
    ),
  );
  const puedeContinuarEtapa =
    esEvaluacionPorEtapa &&
    estaTerminada &&
    cabecera.resultadoGeneral === true &&
    cabecera.esFinal === false &&
    !loteEnEtapaPosterior &&
    !existeEvaluacionEtapaPosterior;
  const tieneIntentoPosteriorMismaEtapa = Boolean(
    cabecera.versionFaseId &&
    rutaLote?.intentos?.some(
      (intento) =>
        intento.versionFaseId === cabecera.versionFaseId &&
        intento.evaluacionId !== cabecera.evaluacionId &&
        intento.intento > cabecera.intento,
    ),
  );
  const puedeReevaluar =
    esEvaluacionPorEtapa &&
    estaTerminada &&
    cabecera.resultadoGeneral === false &&
    !loteEnEtapaPosterior &&
    !tieneIntentoPosteriorMismaEtapa;
  const mostrarSolicitarReapertura = puedeSolicitarReapertura && estaTerminada && !esEvaluacionPorEtapa && !loteEnEtapaPosterior;
  const puedeTerminar = puedeTerminarEvaluacion && estaEnProceso;
  const origenLoteId = (location.state as { loteId?: number } | null)?.loteId;
  const volverA = origenLoteId ? `/operacion/lotes/${origenLoteId}` : "/operacion/evaluaciones";
  const volverTexto = origenLoteId ? "Volver al detalle del lote" : "Volver a evaluaciones";

  return (
    <PageContainer className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link to={volverA} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline">
          <ArrowLeft size={14} /> {volverTexto}
        </Link>
        <span className="hidden h-4 w-px bg-[var(--border)] sm:block" />
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="text-lg font-semibold leading-none tracking-tight">Evaluación en Línea</h1>
          <span className="hidden text-[11px] text-[var(--text-secondary)] lg:inline">Control de calidad</span>
        </div>
        <Badge variant="outline" className="ml-auto w-fit border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">{cabecera.estadoEvaluacion.replaceAll("_", " ")}</Badge>
      </div>

      {rutaLote?.etapas?.length ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-2 shadow-[var(--shadow-card)]">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {rutaLote.etapas.map((etapa) => {
              const intentos = rutaLote.intentos.filter((x) => x.versionFaseId === etapa.versionFaseId);
              const intentoActual = intentos.find((x) => x.evaluacionId === id);
              const ultimo = intentos[intentos.length - 1];
              const destino = intentoActual?.evaluacionId ?? ultimo?.evaluacionId ?? etapa.ultimaEvaluacionId;
              const activa = cabecera.versionFaseId === etapa.versionFaseId;
              const pendiente = etapa.estadoEtapa === "PENDIENTE";
              const conforme = etapa.estadoEtapa === "CONFORME";
              const noConforme = etapa.estadoEtapa === "NO_CONFORME";
              return (
                <button key={etapa.versionFaseId} type="button" disabled={!destino}
                  onClick={() => destino && navigate(`/operacion/evaluaciones/${destino}`)}
                  className={`min-w-[220px] flex-1 rounded-lg border px-3 py-2 text-left transition ${activa ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200" : destino ? "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50" : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">Etapa {etapa.orden}</span>
                    <span className={`text-[10px] font-semibold ${conforme ? "text-emerald-700" : noConforme ? "text-amber-700" : activa ? "text-blue-700" : "text-slate-500"}`}>
                      {conforme ? "✓ CONFORME" : noConforme ? "! NO CONFORME" : pendiente ? "○ PENDIENTE" : "● EN PROCESO"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-semibold">{etapa.codigoReferencia}</span>
                    {etapa.esFinal && <Badge variant="outline" className="h-5 border-emerald-200 bg-emerald-50 px-1.5 text-[9px] text-emerald-700">FINAL</Badge>}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{etapa.faseCodigo} · {etapa.faseDescripcion}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{etapa.cantidadCaracteristicas} características{etapa.cantidadIntentos > 0 ? ` · ${etapa.cantidadIntentos} intento${etapa.cantidadIntentos === 1 ? "" : "s"}` : ""}</div>
                  {intentos.length > 1 && <div className="mt-2 flex flex-wrap gap-1">{intentos.map((it) => <span key={it.evaluacionId} onClick={(e) => { e.stopPropagation(); navigate(`/operacion/evaluaciones/${it.evaluacionId}`); }} className={`rounded border px-1.5 py-0.5 text-[10px] ${it.evaluacionId === id ? "border-blue-300 bg-blue-100 text-blue-800" : "border-slate-200 bg-white text-slate-600"}`}>{it.esReevaluacion ? "Reeval." : "I"}{it.intento}</span>)}</div>}
                </button>
              );
            })}
          </div>
        </div>
      ) : cabecera.versionFaseId ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-2 text-sm">
          <span className="font-semibold text-blue-900">Etapa {cabecera.versionFaseOrden ?? "—"}</span>
          <span className="font-semibold text-blue-800">{cabecera.codigoReferencia ?? cabecera.faseCodigo ?? "—"}</span>
          {cabecera.faseDescripcion && <span className="text-blue-700">· {cabecera.faseDescripcion}</span>}
        </div>
      ) : null}

      <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="grid gap-x-5 gap-y-1 px-4 py-2 xl:grid-cols-[1fr_1.15fr_1.2fr_.8fr_.8fr]">
          <div className="min-w-0"><span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Lote</span><p className="truncate text-sm font-semibold">{cabecera.codigoLote}</p></div>
          <div className="min-w-0"><span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Producto</span><p className="truncate text-sm font-semibold">{cabecera.productoCodigo} <span className="font-normal text-[var(--text-secondary)]">· {cabecera.productoDescripcion}</span></p></div>
          <div className="min-w-0"><span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">ET</span><p className="truncate text-sm font-semibold">{cabecera.documentoCodigo} <span className="font-normal text-[var(--text-secondary)]">· V{cabecera.versionNumero}</span></p></div>
          <div className="min-w-0"><span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Evaluación</span><p className="truncate text-sm font-semibold">{cabecera.tipoEvaluacion} <span className="font-normal text-[var(--text-secondary)]">· I{cabecera.intento}</span></p></div>
          <div className="min-w-0"><span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Evaluador</span><p className="truncate text-sm font-semibold">{cabecera.usuarioEvaluador || "—"}</p></div>
        </CardContent>
      </Card>

      {estaEnProceso ? (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] leading-none text-amber-900">
          <FlaskConical className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{cabecera.esReevaluacion ? "Reevaluación selectiva habilitada." : "Registro parcial habilitado."}</span>
          <span className="text-amber-800">{cabecera.esReevaluacion ? "Solo se muestran los parámetros que no cumplieron en el intento anterior." : "Puedes guardar avances sin cerrar la evaluación."}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] leading-none text-emerald-900">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{cabecera.resultadoGeneral === false ? "Etapa no conforme." : "Evaluación terminada."}</span>
          <span className="text-emerald-800">{cabecera.resultadoGeneral === false ? "La captura está bloqueada. Puedes reevaluar únicamente los parámetros que no cumplieron." : cabecera.esFinal ? "La etapa final quedó consolidada." : "La captura está bloqueada. Si la etapa es conforme, continúa con la siguiente etapa."}</span>
        </div>
      )}

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-semibold">{cabecera.esReevaluacion ? "Parámetros a reevaluar" : "Registro de resultados"}</h2><p className="text-sm text-[var(--text-secondary)]">{avance.resultadosRegistrados} resultados registrados · {avance.obligatoriasCompletas}/{avance.totalObligatorias} obligatorios completos{avance.parametrosPendientes !== undefined ? ` · ${avance.parametrosPendientes} pendientes` : ""}</p></div>
            <div className="text-right text-sm font-medium text-[var(--text-secondary)]"><div>{avance.totalCaracteristicas} características</div>{avance.porcentajeAvance !== undefined && <div className="text-xs">{avance.porcentajeAvance.toFixed(0)}% avance</div>}</div>
          </div>

          <div className="max-h-[calc(100vh-245px)] min-h-[440px] overflow-auto">
            <table className="w-full min-w-[1120px] border-collapse text-sm">
              <thead className="sticky top-0 z-20 bg-[var(--surface-muted)] text-left text-xs uppercase tracking-[0.08em] text-[var(--text-secondary)] shadow-[0_1px_0_var(--border)]">
                <tr><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Característica</th><th className="px-5 py-3">Obligatoria</th><th className="px-5 py-3">Especificación</th><th className="px-5 py-3">Resultado / validación</th><th className="px-5 py-3">Unidad</th></tr>
              </thead>
              <tbody>
                {grupos.map(([grupo, items]) => (
                  <Fragment key={grupo}>
                    <tr key={`group-${grupo}`} className="border-t border-[var(--border)] bg-slate-50/80"><td colSpan={6} className="px-5 py-2.5 font-semibold text-[var(--text)]">{labelGrupo(grupo)} <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">{items.length} parámetros</span></td></tr>
                    {items.map((item) => {
                      const draft = drafts[item.versCaractId] ?? { texto: "", numero: "", cumple: item.cumple, dirty: false };
                      const tieneResultado = draft.numero !== "" || draft.texto.trim() !== "";
                      return (
                        <tr key={item.versCaractId} className="border-t border-[var(--border)] align-top hover:bg-[var(--surface-muted)]/40">
                          <td className="px-5 py-4 text-xs font-medium text-[var(--text-secondary)]">{labelGrupo(grupo)}</td>
                          <td className="px-5 py-4">
                            <p className="font-semibold">{item.caracteristica}</p>
                            {item.metodoEnsayo && <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.metodoEnsayo}</p>}
                            {cabecera.esReevaluacion && item.evaluacionResultadoPadreId && (
                              <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
                                <span className="font-semibold">Resultado anterior:</span>{" "}
                                {item.resultadoNumericoAnterior ?? item.resultadoTextoAnterior ?? "—"}
                                {item.unidad ? ` ${item.unidad}` : ""}
                                {item.observacionAnterior && <p className="mt-1 text-amber-800">{item.observacionAnterior}</p>}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">{item.esObligatorio ? <Badge variant="outline">Sí</Badge> : "No"}</td>
                          <td className="px-5 py-4 font-medium">{item.especificacion || "—"}</td>
                          <td className="px-5 py-4"><ResultadoControl item={item} draft={draft} puedeRegistrar={puedeRegistrarResultados} onChange={(next) => updateDraft(item.versCaractId, next)} /></td>
                          <td className="px-5 py-4">{item.unidad || "—"}</td>
                          <td className="px-5 py-4"><EstadoResultado cumple={draft.dirty ? (item.tipoCriterio?.toUpperCase() === "CUALITATIVO" ? draft.cumple : item.cumple) : item.cumple} tieneResultado={tieneResultado} /></td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">{saveError && <span className="text-red-600">{saveError}</span>}{savedMessage && <span className="text-emerald-700">{savedMessage}</span>}</div>
            <div className="flex gap-2">
              {puedeContinuarEtapa && <Button disabled={continuarMutation.isPending} onClick={() => continuarMutation.mutate({ reevaluacion: false })}><PlayCircle size={16} />{continuarMutation.isPending ? "Preparando..." : "Continuar siguiente etapa"}</Button>}
              {puedeReevaluar && <Button disabled={continuarMutation.isPending} onClick={() => continuarMutation.mutate({ reevaluacion: true })}><RotateCcw size={16} />{continuarMutation.isPending ? "Preparando..." : "Reevaluar no conformes"}</Button>}
              {mostrarSolicitarReapertura && <Button variant="outline" disabled={reopenMutation.isPending} onClick={() => { setSaveError(null); setSavedMessage(null); setReopenOpen(true); }}><RotateCcw size={16} />Solicitar reapertura</Button>}
              {puedeTerminarEvaluacion && <Button variant="outline" disabled={!puedeTerminar || mutation.isPending || finishMutation.isPending} onClick={finishEvaluation}><ShieldCheck size={16} />{finishMutation.isPending ? "Terminando..." : "Terminar evaluación"}</Button>}
              {puedeRegistrarResultados && <Button onClick={save} disabled={!estaEnProceso || mutation.isPending || finishMutation.isPending}><Save size={16} />{mutation.isPending ? "Guardando..." : "Guardar avance"}</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
      {reopenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reopen-title">
          <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="reopen-title" className="text-lg font-semibold">Solicitar reapertura</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">La evaluación permanecerá bloqueada hasta que Calidad autorice la solicitud.</p>
              </div>
              <button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setReopenOpen(false)} aria-label="Cerrar"><X size={18} /></button>
            </div>
            <label className="mt-4 block text-sm font-medium" htmlFor="reopen-reason">Motivo de la reapertura</label>
            <textarea
              id="reopen-reason"
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={reopenReason}
              maxLength={1000}
              placeholder="Describe qué resultado necesitas completar o corregir."
              onChange={(e) => setReopenReason(e.target.value)}
              autoFocus
            />
            <div className="mt-1 text-right text-xs text-[var(--text-secondary)]">{reopenReason.length}/1000</div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReopenOpen(false)} disabled={reopenMutation.isPending}>Cancelar</Button>
              <Button onClick={sendReopenRequest} disabled={!reopenReason.trim() || reopenMutation.isPending}>{reopenMutation.isPending ? "Enviando..." : "Enviar solicitud"}</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
