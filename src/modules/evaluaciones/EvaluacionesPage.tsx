import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownUp, ArrowRight, ChevronLeft, ChevronRight, PlayCircle, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { eliminarEvaluacionPrueba, iniciarEvaluacion, listarEvaluacionesCalidad, listarEvaluacionesPendientesCalculo } from "./api";

const fecha = (value: string | null) => value
  ? new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
  : "—";
type SortKey = "codigoLote" | "tipoEvaluacionDescripcion" | "estadoEvaluacionCodigo" | "usuarioEvaluador" | "ultimaActividad";
type SortDirection = "asc" | "desc";

const estadoClase = (value: string) =>
  value === "TERMINADA" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
  : value === "EN_PROCESO" ? "border-blue-200 bg-blue-50 text-blue-700"
  : "border-amber-200 bg-amber-50 text-amber-700";

export default function EvaluacionesPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const { tienePermiso, tienePerfil } = useAuth();
  const puedeIniciar = tienePermiso("EVALUACION.INICIAR");
  const puedeVer = tienePermiso("EVALUACION.VER");
  const puedeConsolidar = tienePermiso("EVALUACION.CONSOLIDAR");
  const puedeEliminarPrueba = tienePerfil("JEFE_CALIDAD");
  const esAuxiliar = tienePerfil("AUXILIAR_CALIDAD") &&
    !["ANALISTA_CALIDAD", "JEFE_CALIDAD", "ADMINISTRADOR"].some(tienePerfil);
  const [estado, setEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("ultimaActividad");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const pageSize = 10;
  const { data = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["evaluaciones", "listado"],
    queryFn: listarEvaluacionesCalidad,
    enabled: puedeVer,
  });
  const { data: pendientesDecision = [], isError: errorDecision, refetch: refrescarDecision } = useQuery({
    queryKey: ["evaluaciones", "pendientes-calculo"],
    queryFn: listarEvaluacionesPendientesCalculo,
    enabled: puedeConsolidar,
  });
  const pendientesIds = useMemo(
    () => new Set(pendientesDecision.map(item => item.evaluacionId)),
    [pendientesDecision],
  );
  const eliminar = useMutation({
    mutationFn: eliminarEvaluacionPrueba,
    onSuccess: async () => {
      setError("");
      await client.invalidateQueries({ queryKey: ["evaluaciones"] });
      await client.invalidateQueries({ queryKey: ["lotes"] });
      if (puedeConsolidar) {
        await client.invalidateQueries({ queryKey: ["evaluaciones", "pendientes-calculo"] });
      }
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la evaluación de prueba.");
    },
  });

  const iniciar = useMutation({
    mutationFn: iniciarEvaluacion,
    onSuccess: async (response) => {
      setError("");
      await client.invalidateQueries({ queryKey: ["evaluaciones"] });
      await client.invalidateQueries({ queryKey: ["lotes"] });
      if (response.evaluacionId) navigate(`/operacion/evaluaciones/${response.evaluacionId}`);
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "No se pudo iniciar la evaluación.");
      void client.invalidateQueries({ queryKey: ["evaluaciones"] });
    },
  });
  const lotes = useMemo(() => {
    const grupos = new Map<number, typeof data>();
    data.forEach(item => {
      const grupo = grupos.get(item.loteId) ?? [];
      grupo.push(item);
      grupos.set(item.loteId, grupo);
    });
    return Array.from(grupos.values()).map(intentos => {
      const ordenados = [...intentos].sort((a, b) =>
        b.intento - a.intento || b.evaluacionId - a.evaluacionId
      );
      return { actual: ordenados[0], intentos: ordenados };
    });
  }, [data]);
  const visibles = useMemo(() => lotes.filter(({ actual, intentos }) =>
    (estado === "TODOS" || actual.estadoEvaluacionCodigo === estado) &&
    (!busqueda.trim() || [actual.codigoLote, actual.productoCodigo, actual.productoDescripcion,
      actual.usuarioEvaluador ?? "", ...intentos.map(x => x.usuarioEvaluador ?? "")]
      .some(v => v.toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase())))
  ), [lotes, estado, busqueda]);

  const ordenados = useMemo(() => [...visibles].sort((a, b) => {
    const valor = (x: typeof a) => {
      const item = x.actual;
      if (sortKey === "ultimaActividad") return new Date(item.fechaFin || item.fechaInicio || 0).getTime();
      return String(item[sortKey] ?? "");
    };
    const left = valor(a);
    const right = valor(b);
    const cmp = typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right), "es", { numeric: true, sensitivity: "base" });
    return sortDirection === "asc" ? cmp : -cmp;
  }), [visibles, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const paginados = useMemo(
    () => ordenados.slice((page - 1) * pageSize, page * pageSize),
    [ordenados, page]
  );

  const sortBy = (key: SortKey) => {
    if (sortKey === key) setSortDirection(x => x === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const estados = Array.from(new Set(lotes.map(x => x.actual.estadoEvaluacionCodigo)));
  return <PageContainer className="space-y-5">
    <PageHeader eyebrow="Operación · Calidad" title="Evaluaciones"
      description={esAuxiliar ? "Pendientes disponibles y tu historial de evaluaciones." : "Seguimiento general de evaluaciones de Calidad en todos sus estados."}
      actions={<div className="flex gap-2">
        {puedeConsolidar && <Button variant="outline" onClick={() => navigate("/operacion/evaluaciones/consolidacion")}>Pendientes de decisión <ArrowRight size={14}/></Button>}
        <Button variant="outline" onClick={() => { void refetch(); if (puedeConsolidar) void refrescarDecision(); }} disabled={isFetching}><RefreshCw size={15} className={isFetching ? "animate-spin" : ""}/>Actualizar</Button>
      </div>}
    />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {[
        ["Total visibles", lotes.length],
        ["Pendientes", lotes.filter(x => x.actual.estadoEvaluacionCodigo === "PENDIENTE").length],
        ["En proceso", lotes.filter(x => x.actual.estadoEvaluacionCodigo === "EN_PROCESO").length],
        ["Terminadas", lotes.filter(x => x.actual.estadoEvaluacionCodigo === "TERMINADA").length],
        ...(puedeConsolidar ? [["Pendientes de decisión", pendientesDecision.length] as [string, number]] : []),
      ].map(([label, count]) => <Card key={label} className="border-[var(--border)]"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{label}</p><p className="mt-2 text-3xl font-semibold">{count}</p></CardContent></Card>)}
    </section>
    {puedeConsolidar && errorDecision && <p className="text-sm text-amber-700">No se pudo consultar las decisiones pendientes; su estado no está disponible temporalmente.</p>}
    <Card className="overflow-hidden border-[var(--border)]">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-3 border-b border-[var(--border)] p-4">
          <input className="min-w-[230px] flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm" placeholder="Buscar lote, producto o evaluador" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPage(1); }}/>
          <select className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm" value={estado} onChange={e => { setEstado(e.target.value); setPage(1); }}>
            <option value="TODOS">Todos los estados</option>
            {estados.map(x => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        {!puedeVer ? <p className="p-10 text-center text-sm">Sin permiso para consultar evaluaciones.</p>
        : isLoading ? <p className="p-10 text-center text-sm">Cargando evaluaciones...</p>
        : isError ? <p className="p-10 text-center text-sm text-red-600">No se pudo cargar el listado. Verifica que el nuevo procedimiento SQL esté instalado.</p>
        : visibles.length === 0 ? <p className="p-10 text-center text-sm text-[var(--text-secondary)]">No hay evaluaciones para estos filtros.</p>
        : <>
          <div className="h-[calc(100vh-470px)] min-h-[320px] max-h-[520px] overflow-auto">
            <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]"><tr>
                <th className="w-[27%] px-4 py-3"><button type="button" onClick={() => sortBy("codigoLote")} className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-[var(--primary)]">Lote / producto <ArrowDownUp size={13} className={sortKey === "codigoLote" ? "text-[var(--primary)]" : "opacity-40"}/></button></th>
                <th className="w-[18%] px-4 py-3"><button type="button" onClick={() => sortBy("tipoEvaluacionDescripcion")} className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-[var(--primary)]">Evaluación <ArrowDownUp size={13} className={sortKey === "tipoEvaluacionDescripcion" ? "text-[var(--primary)]" : "opacity-40"}/></button></th>
                <th className="w-[19%] px-4 py-3"><button type="button" onClick={() => sortBy("estadoEvaluacionCodigo")} className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-[var(--primary)]">Situación <ArrowDownUp size={13} className={sortKey === "estadoEvaluacionCodigo" ? "text-[var(--primary)]" : "opacity-40"}/></button></th>
                <th className="w-[14%] px-4 py-3"><button type="button" onClick={() => sortBy("usuarioEvaluador")} className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-[var(--primary)]">Responsable <ArrowDownUp size={13} className={sortKey === "usuarioEvaluador" ? "text-[var(--primary)]" : "opacity-40"}/></button></th>
                <th className="w-[13%] px-4 py-3"><button type="button" onClick={() => sortBy("ultimaActividad")} className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-[var(--primary)]">Última actividad <ArrowDownUp size={13} className={sortKey === "ultimaActividad" ? "text-[var(--primary)]" : "opacity-40"}/></button></th>
                <th className="w-[9%] px-4 py-3 text-right">Acción</th>
              </tr></thead><tbody>{paginados.map(({ actual: item, intentos }) => {
            const disponible = item.estadoEvaluacionCodigo === "PENDIENTE" && !item.usuarioEvaluador;
            const pendienteDecision = puedeConsolidar && pendientesIds.has(item.evaluacionId);
            const actividad = item.fechaFin || item.fechaInicio;
            return <tr key={item.evaluacionId} className="border-t border-[var(--border)] align-middle">
              <td className="px-4 py-4"><p className="font-semibold">{item.codigoLote}</p><p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">{item.productoCodigo} · {item.productoDescripcion}</p></td>
              <td className="px-4 py-4"><p className="font-medium">{item.tipoEvaluacionDescripcion}</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{intentos.length} {intentos.length === 1 ? "intento" : "intentos"} · actual I{item.intento}</p></td>
              <td className="px-4 py-4">
                <Badge variant="outline" className={estadoClase(item.estadoEvaluacionCodigo)}>{item.estadoEvaluacionCodigo.replaceAll("_", " ")}</Badge>
                <div className="mt-1.5">
                  {pendienteDecision
                    ? <button type="button" className="text-xs font-medium text-amber-700 hover:underline" onClick={() => navigate("/operacion/evaluaciones/consolidacion")}>Decisión pendiente</button>
                    : item.estadoEvaluacionCodigo === "PENDIENTE" || item.estadoEvaluacionCodigo === "EN_PROCESO"
                      ? <span className="text-xs text-[var(--text-secondary)]">Decisión aún no corresponde</span>
                      : puedeConsolidar && errorDecision
                        ? <span className="text-xs text-amber-700">Decisión no disponible</span>
                        : <span className="text-xs text-[var(--text-secondary)]">{puedeConsolidar ? "Sin decisión pendiente" : "Seguimiento de Calidad"}</span>}
                </div>
              </td>
              <td className="px-4 py-4"><p className="font-medium">{item.usuarioEvaluador || "Sin asignar"}</p></td>
              <td className="px-4 py-4 text-xs"><p className="font-medium">{fecha(actividad)}</p>{item.fechaInicio && item.fechaFin && <p className="mt-0.5 text-[var(--text-secondary)]">Finalizada</p>}</td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {disponible && puedeIniciar
                    ? <Button size="sm" disabled={iniciar.isPending} onClick={() => iniciar.mutate(item.evaluacionId)}><PlayCircle size={14}/>Iniciar</Button>
                    : <Button size="sm" variant="outline" className="bg-white shadow-sm hover:bg-slate-50" disabled={!puedeVer} onClick={() => navigate(`/operacion/evaluaciones/${item.evaluacionId}`)}>Ver detalle <ArrowRight size={14}/></Button>}
                  {puedeEliminarPrueba && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 bg-white text-red-700 shadow-sm hover:bg-red-50 hover:text-red-800"
                      disabled={eliminar.isPending}
                      title="Eliminar evaluación de prueba"
                      onClick={() => {
                        const ok = window.confirm(
                          `¿Eliminar la evaluación ${item.evaluacionId} y sus reevaluaciones dependientes? Esta acción no se puede deshacer.`
                        );
                        if (ok) eliminar.mutate(item.evaluacionId);
                      }}
                    >
                      <Trash2 size={14}/>
                    </Button>
                  )}
                </div>
              </td>
            </tr>;
          })}</tbody></table>
          </div>
          <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--text-secondary)]">
              Mostrando <span className="font-semibold text-[var(--text)]">{ordenados.length ? (page - 1) * pageSize + 1 : 0}</span>–<span className="font-semibold text-[var(--text)]">{Math.min(page * pageSize, ordenados.length)}</span> de <span className="font-semibold text-[var(--text)]">{ordenados.length}</span> evaluaciones
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-white" disabled={page === 1} onClick={() => setPage(x => Math.max(1, x - 1))}><ChevronLeft size={15}/>Anterior</Button>
              <span className="min-w-24 text-center text-xs font-medium text-[var(--text-secondary)]">Página {page} de {totalPages}</span>
              <Button variant="outline" size="sm" className="bg-white" disabled={page === totalPages} onClick={() => setPage(x => Math.min(totalPages, x + 1))}>Siguiente<ChevronRight size={15}/></Button>
            </div>
          </div>
        </>}
        {error && <p className="border-t border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
  </PageContainer>;
}
