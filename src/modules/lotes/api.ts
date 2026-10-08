import { api } from "@/lib/api";
import type { CatalogosLote, DetalleLote, GenerarLoteRequest, GenerarLoteResponse, LoteListado, LotesFiltros, ProductoGenesis } from "./types";

export async function listarLotes(filtros: LotesFiltros = {}) {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, value]) => value !== undefined && value !== ""));
  const { data } = await api.get<LoteListado[]>("/api/lotes", { params });
  return data;
}

export async function obtenerCatalogosLote() {
  const { data } = await api.get<CatalogosLote>("/api/lotes/catalogos");
  return data;
}

export async function buscarProductosGenesis(busqueda: string) {
  const { data } = await api.get<ProductoGenesis[]>("/api/lotes/productos-genesis", { params: { busqueda } });
  return data;
}

export async function generarLote(request: GenerarLoteRequest) {
  const { data } = await api.post<GenerarLoteResponse>("/api/lotes/generar", request);
  return data;
}

export async function obtenerDetalleLote(loteId: number) {
  const { data } = await api.get<DetalleLote>(`/api/lotes/${loteId}`);
  return data;
}


export async function eliminarLotePrueba(loteId: number) {
  const { data } = await api.delete<{
    codigoResultado: number;
    mensaje: string;
    loteId: number;
    codigoLote: string;
    usuario: string;
  }>(`/api/lotes/${loteId}/pruebas`);
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}
