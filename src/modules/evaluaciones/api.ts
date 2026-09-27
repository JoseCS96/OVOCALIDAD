import { api } from "@/lib/api";
import type {
  Evaluacion,
  GuardarResultadoRequest,
  OperacionResponse,
  PanelEvaluador,
  SolicitarReaperturaResponse,
  TerminarEvaluacionResponse,
} from "./types";

export async function obtenerPanelEvaluador() {
  const { data } = await api.get<PanelEvaluador>("/api/evaluaciones/mi-panel");
  return data;
}

export async function obtenerEvaluacion(evaluacionId: number) {
  const { data } = await api.get<Evaluacion>(`/api/evaluaciones/${evaluacionId}`);
  return data;
}

export async function iniciarEvaluacion(evaluacionId: number) {
  const { data } = await api.post<OperacionResponse>(`/api/evaluaciones/${evaluacionId}/iniciar`);
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}

export async function guardarResultado(evaluacionId: number, request: GuardarResultadoRequest) {
  const { data } = await api.put<OperacionResponse>(`/api/evaluaciones/${evaluacionId}/resultados`, request);
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}

export async function terminarEvaluacion(evaluacionId: number) {
  const { data } = await api.post<TerminarEvaluacionResponse>(`/api/evaluaciones/${evaluacionId}/terminar`);
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}

export async function solicitarReapertura(evaluacionId: number, motivo: string) {
  const { data } = await api.post<SolicitarReaperturaResponse>(
    `/api/evaluaciones/${evaluacionId}/solicitudes-reapertura`,
    { motivo },
  );
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}
