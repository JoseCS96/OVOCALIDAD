import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, ChevronLeft, ChevronRight, Eye, FilterX, Plus, RefreshCw, Search } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listarLotes } from "./api";
import GenerarLoteModal from "./GenerarLoteModal";
import type { LotesFiltros } from "./types";

type SortKey = "codigoLote" | "productoCodigo" | "fechaHoraProduccion" | "faseDescripcion" | "lineaOrigenCodigo" | "estadoLoteDescripcion" | "estadoEvaluacionDescripcion";
type SortDirection = "asc" | "desc";

const estadoLoteOptions = [
  { id: 1, label: "Pendiente" },
  { id: 2, label: "En evaluación" },
  { id: 3, label: "Liberado" },
  { id: 4, label: "No conforme" },
  { id: 5, label: "Certificado" },
  { id: 6, label: "Anulado" },
];

const estadoEvaluacionOptions = [
  { id: 5, label: "Pendiente" },
  { id: 1, label: "En proceso" },
  { id: 2, label: "Terminada" },
  { id: 3, label: "Anulada" },
];

function badgeClass(codigo?: string | null) {
  switch (codigo) {
    case "LIBERADO":
    case "TERMINADA":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "NO_CONFORME":
    case "ANULADA":
      return "border-red-200 bg-red-50 text-red-700";
    case "EVALUACION":
    case "EN_PROCESO":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CERTIFICADO":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LotesPage() {
  const [draft, setDraft] = useState<LotesFiltros>({});
  const [filtros, setFiltros] = useState<LotesFiltros>({});
  const [generarOpen, setGenerarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("fechaHoraProduccion");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const pageSize = 10;

  const { data = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["lotes", filtros],
    queryFn: () => listarLotes(filtros),
  });

  useEffect(() => { setPage(1); }, [filtros]);

  const sortedData = useMemo(() => [...data].sort((a, b) => {
    const left = a[sortKey] ?? "";
    const right = b[sortKey] ?? "";
    const comparison = sortKey === "fechaHoraProduccion"
      ? new Date(String(left)).getTime() - new Date(String(right)).getTime()
      : String(left).localeCompare(String(right), "es", { numeric: true, sensitivity: "base" });
    return sortDirection === "asc" ? comparison : -comparison;
  }), [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = useMemo(() => sortedData.slice((page - 1) * pageSize, page * pageSize), [sortedData, page]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const totalConEvaluacion = useMemo(
    () => data.filter((item) => item.evaluacionId !== null).length,
    [data]
  );

  function sortBy(key: SortKey) {
    if (sortKey === key) setSortDirection((x) => x === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
    setPage(1);
  }

  function applyFilters() {
    setFiltros({
      codigoLote: draft.codigoLote?.trim() || undefined,
      productoCodigo: draft.productoCodigo?.trim() || undefined,
      estadoLoteId: draft.estadoLoteId,
      estadoEvaluacionId: draft.estadoEvaluacionId,
      fechaDesde: draft.fechaDesde || undefined,
      fechaHasta: draft.fechaHasta || undefined,
    });
  }

  function clearFilters() {
    setDraft({});
    setFiltros({});
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        title="Lotes"
        description="Consulta operativa de lotes y su última evaluación registrada."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              Actualizar
            </Button>
            <Button size="lg" className="min-w-44 bg-[var(--primary)] px-5 font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] hover:shadow-lg" onClick={() => setGenerarOpen(true)}>
              <Plus size={17} />
              Generar lote
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Lotes visibles</p>
            <p className="mt-2 text-3xl font-semibold">{data.length}</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Con evaluación</p>
            <p className="mt-2 text-3xl font-semibold">{totalConEvaluacion}</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Sin evaluación</p>
            <p className="mt-2 text-3xl font-semibold">{data.length - totalConEvaluacion}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="p-5">
          <div className="grid gap-3 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text-secondary)]" />
              <Input
                className="pl-9"
                placeholder="Buscar código de lote"
                value={draft.codigoLote ?? ""}
                onChange={(e) => setDraft((x) => ({ ...x, codigoLote: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>

            <Input
              placeholder="Código producto"
              value={draft.productoCodigo ?? ""}
              onChange={(e) => setDraft((x) => ({ ...x, productoCodigo: e.target.value }))}
            />

            <select
              className="h-9 rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={draft.estadoLoteId ?? ""}
              onChange={(e) => setDraft((x) => ({ ...x, estadoLoteId: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Estado lote</option>
              {estadoLoteOptions.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>

            <select
              className="h-9 rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={draft.estadoEvaluacionId ?? ""}
              onChange={(e) => setDraft((x) => ({ ...x, estadoEvaluacionId: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Estado evaluación</option>
              {estadoEvaluacionOptions.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>

            <Button onClick={applyFilters}>
              <Search size={16} />
              Buscar
            </Button>

            <Input type="date" value={draft.fechaDesde ?? ""} onChange={(e) => setDraft((x) => ({ ...x, fechaDesde: e.target.value }))} />
            <Input type="date" value={draft.fechaHasta ?? ""} onChange={(e) => setDraft((x) => ({ ...x, fechaHasta: e.target.value }))} />
            <Button variant="outline" onClick={clearFilters} className="lg:col-span-2 lg:justify-self-start">
              <FilterX size={16} />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--surface-muted)] text-left text-xs uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-5 py-3"><button type="button" onClick={() => sortBy("codigoLote")} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-[0.08em] hover:text-[var(--primary)]">Lote<ArrowDownUp size={13} className={sortKey === "codigoLote" ? "text-[var(--primary)]" : "opacity-45 group-hover:opacity-100"} /></button></th>
                  <th className="px-5 py-3"><button type="button" onClick={() => sortBy("productoCodigo")} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-[0.08em] hover:text-[var(--primary)]">Producto<ArrowDownUp size={13} className={sortKey === "productoCodigo" ? "text-[var(--primary)]" : "opacity-45 group-hover:opacity-100"} /></button></th>
                  <th className="px-5 py-3"><button type="button" onClick={() => sortBy("fechaHoraProduccion")} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-[0.08em] hover:text-[var(--primary)]">Producción<ArrowDownUp size={13} className={sortKey === "fechaHoraProduccion" ? "text-[var(--primary)]" : "opacity-45 group-hover:opacity-100"} /></button></th>
                  <th className="px-5 py-3"><button type="button" onClick={() => sortBy("faseDescripcion")} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-[0.08em] hover:text-[var(--primary)]">Fase<ArrowDownUp size={13} className={sortKey === "faseDescripcion" ? "text-[var(--primary)]" : "opacity-45 group-hover:opacity-100"} /></button></th>
                  <th className="px-5 py-3"><button type="button" onClick={() => sortBy("lineaOrigenCodigo")} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-[0.08em] hover:text-[var(--primary)]">Línea<ArrowDownUp size={13} className={sortKey === "lineaOrigenCodigo" ? "text-[var(--primary)]" : "opacity-45 group-hover:opacity-100"} /></button></th>
                  <th className="px-5 py-3"><button type="button" onClick={() => sortBy("estadoLoteDescripcion")} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-[0.08em] hover:text-[var(--primary)]">Estado lote<ArrowDownUp size={13} className={sortKey === "estadoLoteDescripcion" ? "text-[var(--primary)]" : "opacity-45 group-hover:opacity-100"} /></button></th>
                  <th className="px-5 py-3"><button type="button" onClick={() => sortBy("estadoEvaluacionDescripcion")} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-[0.08em] hover:text-[var(--primary)]">Evaluación<ArrowDownUp size={13} className={sortKey === "estadoEvaluacionDescripcion" ? "text-[var(--primary)]" : "opacity-45 group-hover:opacity-100"} /></button></th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-[var(--text-secondary)]">Cargando lotes...</td></tr>
                ) : isError ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-red-600">No se pudo consultar la API de lotes.</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-[var(--text-secondary)]">No hay lotes para los filtros seleccionados.</td></tr>
                ) : pagedData.map((lote) => (
                  <tr key={lote.loteId} className="border-t border-[var(--border)] hover:bg-[var(--surface-muted)]/70">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text)]">{lote.codigoLote}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">ID {lote.loteId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{lote.productoCodigo}</div>
                      <div className="mt-1 max-w-[260px] truncate text-xs text-[var(--text-secondary)]">{lote.productoDescripcion}</div>
                    </td>
                    <td className="px-5 py-4">{formatDate(lote.fechaHoraProduccion)}</td>
                    <td className="px-5 py-4">{lote.faseDescripcion || lote.faseCodigo}</td>
                    <td className="px-5 py-4">{lote.lineaOrigenCodigo}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={badgeClass(lote.estadoLoteCodigo)}>
                        {lote.estadoLoteDescripcion}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {lote.evaluacionId === null ? (
                        <span className="text-[var(--text-secondary)]">Sin evaluación</span>
                      ) : (
                        <div>
                          <Badge variant="outline" className={badgeClass(lote.estadoEvaluacionCodigo)}>
                            {lote.estadoEvaluacionDescripcion}
                          </Badge>
                          <div className="mt-1 text-xs text-[var(--text-secondary)]">Intento {lote.intentoEvaluacion ?? "—"}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="outline" size="sm" disabled>
                        <Eye size={15} />
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && !isError && data.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[var(--text-secondary)]">
                Mostrando <span className="font-semibold text-[var(--text)]">{(page - 1) * pageSize + 1}</span>–<span className="font-semibold text-[var(--text)]">{Math.min(page * pageSize, data.length)}</span> de <span className="font-semibold text-[var(--text)]">{data.length}</span> lotes
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((x) => Math.max(1, x - 1))}><ChevronLeft size={15} />Anterior</Button>
                <span className="min-w-24 text-center text-xs font-medium text-[var(--text-secondary)]">Página {page} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((x) => Math.min(totalPages, x + 1))}>Siguiente<ChevronRight size={15} /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <GenerarLoteModal open={generarOpen} onClose={() => setGenerarOpen(false)} onCreated={() => refetch()} />
    </PageContainer>
  );
}
