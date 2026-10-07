import { api } from "@/lib/api";
import type { TrazabilidadLote } from "./types";

export async function obtenerTrazabilidadLote(loteId: number) {
  const { data } = await api.get<TrazabilidadLote>(`/api/lotes/${loteId}/trazabilidad`);
  return data;
}
