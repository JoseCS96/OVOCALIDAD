import { api } from "@/lib/api";
import type {
  Evaluacion,
  GuardarResultadoRequest,
  OperacionResponse,
  PanelEvaluador,
  PanelEvaluacionItem,
  SolicitarReaperturaResponse,
  TerminarEvaluacionResponse,
  SolicitudReaperturaDetalle,
  SolicitudReaperturaItem,
  ResolverReaperturaResponse,
  EvaluacionPendienteCalculo,
  PrecalculoEvaluacionesResponse,
  ConsolidacionEvaluacionResultado,
  CrearEvaluacionRequest,
  CrearEvaluacionResponse,
  RutaEvaluacionLote,
} from "./types";


export async function crearEvaluacion(request: CrearEvaluacionRequest) {
  const { data } = await api.post<CrearEvaluacionResponse>("/api/evaluaciones/crear", request);
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}

export async function obtenerPanelEvaluador() {
  const { data } = await api.get<PanelEvaluador>("/api/evaluaciones/mi-panel");
  return data;
}

export async function obtenerRutaEvaluacionLote(loteId: number) {
  const { data } = await api.get<RutaEvaluacionLote>(`/api/evaluaciones/lote/${loteId}/ruta`);
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

export async function listarSolicitudesReapertura(estado?: string) {
  const { data } = await api.get<SolicitudReaperturaItem[]>("/api/evaluaciones/reaperturas", {
    params: estado ? { estado } : undefined,
  });
  return data;
}

export async function obtenerSolicitudReapertura(solicitudReaperturaId: number) {
  const { data } = await api.get<SolicitudReaperturaDetalle>(
    `/api/evaluaciones/reaperturas/${solicitudReaperturaId}`
  );
  return data;
}

export async function resolverSolicitudReapertura(
  solicitudReaperturaId: number,
  request: { aprobar: boolean; observacion: string | null },
) {
  const { data } = await api.post<ResolverReaperturaResponse>(
    `/api/evaluaciones/reaperturas/${solicitudReaperturaId}/resolver`,
    request,
  );
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}


export async function listarEvaluacionesPendientesCalculo() {
  const { data } = await api.get<EvaluacionPendienteCalculo[]>("/api/evaluaciones/pendientes-calculo");
  return data;
}

export async function precalcularDisposicion(evaluacionIds: number[]) {
  const { data } = await api.post<PrecalculoEvaluacionesResponse>(
    "/api/evaluaciones/precalcular-disposicion",
    { evaluacionIds },
  );
  return data;
}

export async function consolidarEvaluaciones(evaluacionIds: number[], observacion?: string | null) {
  const { data } = await api.post<ConsolidacionEvaluacionResultado[]>(
    "/api/evaluaciones/consolidar",
    { evaluacionIds, observacion: observacion?.trim() || null },
  );
  return data;
}

export async function listarEvaluacionesCalidad() {
  const { data } = await api.get<PanelEvaluacionItem[]>("/api/evaluaciones/listado");
  return data;
}


export async function eliminarEvaluacionPrueba(evaluacionId: number) {
  const { data } = await api.delete<{
    codigoResultado: number;
    mensaje: string;
    evaluacionId: number;
    usuario: string;
  }>(`/api/evaluaciones/${evaluacionId}/pruebas`);
  if (data.codigoResultado !== 0) throw new Error(data.mensaje);
  return data;
}
