export type EvaluacionCabecera = {
  evaluacionId: number;
  loteId: number;
  codigoLote: string;
  productoCodigo: string;
  productoDescripcion: string;
  documentoId: number;
  documentoCodigo: string;
  documentoDescripcionDocumento: string;
  versionId: number;
  versionNumero: number;
  tipoEvaluacionId: number;
  tipoEvaluacion: string;
  estadoEvaluacionId: number;
  estadoEvaluacion: string;
  intento: number;
  usuarioEvaluador: string;
  fechaInicio: string;
  fechaFin: string | null;
  observacion: string | null;
  resultadoGeneral: boolean | null;
};

export type EvaluacionDetalle = {
  evaluacionResultadoId: number | null;
  versCaractId: number;
  tipoCaracteristica: string;
  caracteristica: string;
  tipoCriterioId: number | null;
  tipoCriterio: string | null;
  especificacion: string | null;
  unidad: string | null;
  metodoEnsayo: string | null;
  orden: number;
  esObligatorio: boolean;
  tipoResultado: "NUMERICO" | "TEXTO";
  resultadoNumerico: number | null;
  resultadoTexto: string | null;
  cumple: boolean | null;
  permiteEditar: boolean;
};

export type EvaluacionAvance = {
  totalCaracteristicas: number;
  totalObligatorias: number;
  resultadosRegistrados: number;
  obligatoriasCompletas: number;
};

export type Evaluacion = {
  cabecera: EvaluacionCabecera;
  detalle: EvaluacionDetalle[];
  avance: EvaluacionAvance;
};

export type GuardarResultadoRequest = {
  versCaractId: number;
  resultadoTexto: string | null;
  resultadoNumerico: number | null;
  cumple: boolean | null;
  observacion: string | null;
  usuario: string;
};

export type PanelEvaluadorIndicadores = {
  pendientesDisponibles: number;
  pendientesAsignadas: number;
  enProceso: number;
  atendidasHoy: number;
  iniciadasHoy: number;
};

export type PanelEvaluacionItem = {
  evaluacionId: number;
  loteId: number;
  codigoLote: string;
  productoCodigo: string;
  productoDescripcion: string;
  tipoEvaluacionId: number;
  tipoEvaluacionCodigo: string;
  tipoEvaluacionDescripcion: string;
  estadoEvaluacionId: number;
  estadoEvaluacionCodigo: string;
  estadoEvaluacionDescripcion: string;
  estadoLoteId: number;
  estadoLoteCodigo: string;
  estadoLoteDescripcion: string;
  intento: number;
  fechaHoraProduccion: string;
  fechaCreacionEvaluacion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  resultadoGeneral: boolean | null;
  usuarioEvaluador: string | null;
  motivoReevaluacion: string | null;
  observacion: string | null;
  fechaUltimaActualizacion: string | null;
};

export type PanelEvaluadorResumenEstado = {
  estadoCodigo: string;
  estadoDescripcion: string;
  cantidad: number;
};

export type PanelEvaluador = {
  indicadores: PanelEvaluadorIndicadores;
  pendientesDisponibles: PanelEvaluacionItem[];
  misEvaluaciones: PanelEvaluacionItem[];
  atendidasHoy: PanelEvaluacionItem[];
  resumenEstados: PanelEvaluadorResumenEstado[];
};

export type OperacionResponse = {
  codigoResultado: number;
  mensaje: string;
  evaluacionId?: number | null;
  loteId?: number | null;
  codigoLote?: string | null;
  estadoEvaluacion?: string | null;
  estadoLote?: string | null;
  cumple?: boolean | null;
  resultadoGeneral?: boolean | null;
  resultadoDescripcion?: string | null;
  totalParametros?: number | null;
  totalObligatorios?: number | null;
  obligatoriosEvaluados?: number | null;
  cumplen?: number | null;
  noCumplen?: number | null;
};
