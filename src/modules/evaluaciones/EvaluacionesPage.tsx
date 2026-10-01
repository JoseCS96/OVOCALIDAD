import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, PlayCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { iniciarEvaluacion, listarEvaluacionesCalidad, listarEvaluacionesPendientesCalculo } from "./api";

const fecha = (value: string | null) => value
  ? new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
  : "—";
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
  const esAuxiliar = tienePerfil("AUXILIAR_CALIDAD") &&
    !["ANALISTA_CALIDAD", "JEFE_CALIDAD", "ADMINISTRADOR"].some(tienePerfil);
  const [estado, setEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
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
  const visibles = useMemo(() => data.filter(x =>
    (estado === "TODOS" || x.estadoEvaluacionCodigo === estado) &&
    (!busqueda.trim() || [x.codigoLote, x.productoCodigo, x.productoDescripcion, x.usuarioEvaluador ?? ""]
      .some(v => v.toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase())))
  ), [data, estado, busqueda]);
  const estados = Array.from(new Set(data.map(x => x.estadoEvaluacionCodigo)));
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
        ["Total visibles", data.length],
        ["Pendientes", data.filter(x => x.estadoEvaluacionCodigo === "PENDIENTE").length],
        ["En proceso", data.filter(x => x.estadoEvaluacionCodigo === "EN_PROCESO").length],
        ["Terminadas", data.filter(x => x.estadoEvaluacionCodigo === "TERMINADA").length],
        ...(puedeConsolidar ? [["Pendientes de decisión", pendientesDecision.length] as [string, number]] : []),
      ].map(([label, count]) => <Card key={label} className="border-[var(--border)]"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{label}</p><p className="mt-2 text-3xl font-semibold">{count}</p></CardContent></Card>)}
    </section>
    {puedeConsolidar && errorDecision && <p className="text-sm text-amber-700">No se pudo consultar las decisiones pendientes; su estado no está disponible temporalmente.</p>}
    <Card className="overflow-hidden border-[var(--border)]">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-3 border-b border-[var(--border)] p-4">
          <input className="min-w-[230px] flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm" placeholder="Buscar lote, producto o evaluador" value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
          <select className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm" value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="TODOS">Todos los estados</option>
            {estados.map(x => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        {!puedeVer ? <p className="p-10 text-center text-sm">Sin permiso para consultar evaluaciones.</p>
        : isLoading ? <p className="p-10 text-center text-sm">Cargando evaluaciones...</p>
        : isError ? <p className="p-10 text-center text-sm text-red-600">No se pudo cargar el listado. Verifica que el nuevo procedimiento SQL esté instalado.</p>
        : visibles.length === 0 ? <p className="p-10 text-center text-sm text-[var(--text-secondary)]">No hay evaluaciones para estos filtros.</p>
        : <div className="overflow-x-auto"><table className="w-full min-w-[1100px] table-fixed text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]"><tr>
            <th className="w-[23%] px-3 py-3">Lote / producto</th><th className="w-[14%] px-3 py-3">Tipo</th><th className="w-[11%] px-3 py-3 text-center">Estado</th><th className="w-[16%] px-3 py-3 text-center">Decisión de Calidad</th><th className="w-[11%] px-3 py-3 text-center">Evaluador</th><th className="w-[14%] px-3 py-3 text-center">Inicio / fin</th><th className="w-[11%] px-3 py-3 text-center">Acción</th>
          </tr></thead><tbody>{visibles.map(item => {
            const disponible = item.estadoEvaluacionCodigo === "PENDIENTE" && !item.usuarioEvaluador;
            return <tr key={item.evaluacionId} className="border-t border-[var(--border)]">
              <td className="px-3 py-4 align-middle"><p className="font-semibold">{item.codigoLote}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoCodigo} · {item.productoDescripcion}</p></td>
              <td className="px-4 py-4">{item.tipoEvaluacionDescripcion}<p className="text-xs text-[var(--text-secondary)]">Intento {item.intento}</p></td>
              <td className="px-4 py-4"><Badge variant="outline" className={estadoClase(item.estadoEvaluacionCodigo)}>{item.estadoEvaluacionCodigo.replaceAll("_", " ")}</Badge></td>
              <td className="px-4 py-4">
                {puedeConsolidar && pendientesIds.has(item.evaluacionId)
                  ? <button type="button" className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" onClick={() => navigate("/operacion/evaluaciones/consolidacion")} title="Ir a revisar decisión">Pendiente - Revisar decisión</button>
                  : item.estadoEvaluacionCodigo === "PENDIENTE" || item.estadoEvaluacionCodigo === "EN_PROCESO"
                    ? <span className="text-xs text-[var(--text-secondary)]">Aún no corresponde</span>
                    : puedeConsolidar && errorDecision
                      ? <span className="text-xs text-amber-700">No disponible</span>
                      : <span className="text-xs text-[var(--text-secondary)]">{puedeConsolidar ? "No figura pendiente" : "Consultar con Jefatura"}</span>}
              </td>
              <td className="px-4 py-4">{item.usuarioEvaluador || "Sin asignar"}</td>
              <td className="px-3 py-4 text-center align-middle text-xs">{fecha(item.fechaInicio)}<p className="text-[var(--text-secondary)]">{fecha(item.fechaFin)}</p></td>
              <td className="px-3 py-4 text-center align-middle">{disponible && puedeIniciar
                ? <Button size="sm" disabled={iniciar.isPending} onClick={() => iniciar.mutate(item.evaluacionId)}><PlayCircle size={14}/>Iniciar</Button>
                : <Button size="sm" variant="outline" disabled={!puedeVer} onClick={() => navigate(`/operacion/evaluaciones/${item.evaluacionId}`)}>Ver detalle <ArrowRight size={14}/></Button>}</td>
            </tr>;
          })}</tbody></table></div>}
        {error && <p className="border-t border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
  </PageContainer>;
}
