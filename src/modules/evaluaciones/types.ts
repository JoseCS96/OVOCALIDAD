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
};

export type EvaluacionDetalle = {
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

export type OperacionResponse = {
  codigoResultado: number;
  mensaje: string;
  evaluacionId?: number | null;
  loteId?: number | null;
  codigoLote?: string | null;
  estadoEvaluacion?: string | null;
  estadoLote?: string | null;
  cumple?: boolean | null;
};
