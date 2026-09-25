import axios from "axios";
import type { CatalogosLote, DetalleLote, GenerarLoteRequest, GenerarLoteResponse, LoteListado, LotesFiltros } from "./types";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "" });

export async function listarLotes(filtros: LotesFiltros = {}) {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, value]) => value !== undefined && value !== ""));
  const { data } = await api.get<LoteListado[]>("/api/lotes", { params });
  return data;
}

export async function obtenerCatalogosLote() {
  const { data } = await api.get<CatalogosLote>("/api/lotes/catalogos");
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
