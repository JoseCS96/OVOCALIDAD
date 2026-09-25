import { Fragment, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FlaskConical, Save, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { guardarResultado, obtenerEvaluacion } from "./api";
import type { EvaluacionDetalle, GuardarResultadoRequest } from "./types";

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
  if ((criterio === "MINIMO" || criterio === "MAXIMO" || criterio === "IGUAL") && numeros[0] !== undefined) return { numero: String(numeros[0]), texto: "" };
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
  if (criterio === "IGUAL") return numeros[0] !== undefined ? valor === numeros[0] : null;

  return null;
}

function ResultadoControl({ item, draft, onChange }: { item: EvaluacionDetalle; draft: Draft; onChange: (next: Partial<Draft>) => void }) {
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
          disabled={!item.permiteEditar}
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
          disabled={!item.permiteEditar}
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
        disabled={!item.permiteEditar}
        placeholder="0.00"
        onChange={(e) => onChange({ numero: e.target.value, texto: "", cumple: null, dirty: true })}
      />
      <EstadoResultado cumple={cumpleLocal} tieneResultado={draft.numero.trim() !== ""} />
    </div>
  );
}

export default function EvaluacionEnLineaPage() {
  const { evaluacionId } = useParams();
  const id = Number(evaluacionId);
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["evaluacion", id],
    queryFn: () => obtenerEvaluacion(id),
    enabled: Number.isFinite(id) && id > 0,
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
      if (!draft?.dirty) continue;
      const criterio = (item.tipoCriterio ?? "").toUpperCase();
      if (["MINIMO", "MAXIMO", "RANGO"].includes(criterio) && draft.numero === "") {
        setSaveError(`Ingresa un resultado para ${item.caracteristica}.`);
        return;
      }
      if (["AUSENCIA", "CUALITATIVO"].includes(criterio) && !draft.texto.trim()) {
        setSaveError(`Ingresa un resultado para ${item.caracteristica}.`);
        return;
      }
      if (criterio === "CUALITATIVO" && draft.cumple === null) {
        setSaveError(`Indica Cumple/No cumple para ${item.caracteristica}.`);
        return;
      }
      requests.push({
        versCaractId: item.versCaractId,
        resultadoTexto: ["AUSENCIA", "CUALITATIVO"].includes(criterio) ? draft.texto.trim() : null,
        resultadoNumerico: ["MINIMO", "MAXIMO", "RANGO"].includes(criterio) ? Number(draft.numero) : null,
        cumple: criterio === "CUALITATIVO" ? calcularCumpleLocal(item, draft) : null,
        observacion: null,
        usuario: "USUARIO_WEB",
      });
    }

    if (requests.length === 0) {
      setSavedMessage("No hay cambios pendientes por guardar.");
      return;
    }
    mutation.mutate(requests);
  }

  if (isLoading) return <PageContainer><div className="py-20 text-center text-[var(--text-secondary)]">Cargando evaluación...</div></PageContainer>;
  if (isError || !data) return <PageContainer><div className="py-20 text-center text-red-600">No se pudo cargar la evaluación.</div></PageContainer>;

  const { cabecera, avance } = data;

  return (
    <PageContainer className="space-y-3">
      <div>
        <Link to="/operacion/lotes" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline">
          <ArrowLeft size={16} /> Volver a lotes
        </Link>
        <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Operación · Control de calidad</p>
            <h1 className="text-2xl font-semibold tracking-tight">Evaluación en Línea</h1>
            <p className="text-xs text-[var(--text-secondary)]">Registro de resultados contra la especificación técnica vigente del lote.</p>
          </div>
          <Badge variant="outline" className="w-fit border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">{cabecera.estadoEvaluacion.replaceAll("_", " ")}</Badge>
        </div>
      </div>

      <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="grid gap-3 px-4 py-3 md:grid-cols-2 xl:grid-cols-5">
          <div><p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Lote</p><p className="font-semibold">{cabecera.codigoLote}</p></div>
          <div><p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Producto</p><p className="mt-1 font-semibold">{cabecera.productoCodigo}</p><p className="text-xs text-[var(--text-secondary)]">{cabecera.productoDescripcion}</p></div>
          <div><p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Especificación técnica</p><p className="mt-1 font-semibold">{cabecera.documentoCodigo}</p><p className="text-xs text-[var(--text-secondary)]">Versión {cabecera.versionNumero}</p></div>
          <div><p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Evaluación</p><p className="mt-1 font-semibold">{cabecera.tipoEvaluacion}</p><p className="text-xs text-[var(--text-secondary)]">Intento {cabecera.intento}</p></div>
          <div><p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Evaluador</p><p className="mt-1 font-semibold">{cabecera.usuarioEvaluador || "—"}</p></div>
        </CardContent>
      </Card>

      <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex flex-wrap items-center gap-x-2"><p className="font-semibold">Registro parcial habilitado.</p><p className="text-amber-800">Puedes guardar avances sin cerrar la evaluación.</p></div>
      </div>

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-semibold">Registro de resultados</h2><p className="text-sm text-[var(--text-secondary)]">{avance.resultadosRegistrados} resultados registrados · {avance.obligatoriasCompletas}/{avance.totalObligatorias} obligatorios completos</p></div>
            <div className="text-sm font-medium text-[var(--text-secondary)]">{avance.totalCaracteristicas} características</div>
          </div>

          <div className="max-h-[calc(100vh-390px)] min-h-[330px] overflow-auto">
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
                          <td className="px-5 py-4"><p className="font-semibold">{item.caracteristica}</p>{item.metodoEnsayo && <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.metodoEnsayo}</p>}</td>
                          <td className="px-5 py-4">{item.esObligatorio ? <Badge variant="outline">Sí</Badge> : "No"}</td>
                          <td className="px-5 py-4 font-medium">{item.especificacion || "—"}</td>
                          <td className="px-5 py-4"><ResultadoControl item={item} draft={draft} onChange={(next) => updateDraft(item.versCaractId, next)} /></td>
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
              <Button variant="outline" disabled><ShieldCheck size={16} />Cerrar evaluación</Button>
              <Button onClick={save} disabled={mutation.isPending}><Save size={16} />{mutation.isPending ? "Guardando..." : "Guardar avance"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
