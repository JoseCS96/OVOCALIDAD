import axios from "axios";
import type { LoteListado, LotesFiltros } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://localhost:7190",
});

export async function listarLotes(filtros: LotesFiltros = {}) {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, value]) => value !== undefined && value !== "")
  );

  const { data } = await api.get<LoteListado[]>("/api/lotes", { params });
  return data;
}
