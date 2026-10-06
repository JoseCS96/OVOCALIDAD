export type EvaluacionCabecera = {
  evaluacionId: number;
  loteId: number;
  codigoLote: string;
  productoCodigo: string;
  codigoGenesis?: string | null;
  productoDescripcion: string;
  kardex?: number | null;
  documentoId: number;
  documentoCodigo: string;
  documentoDescripcionDocumento: string;
  versionId: number;
  versionNumero: number;
  versionFaseId?: number | null;
  versionFaseOrden?: number | null;
  codigoReferencia?: string | null;
  versionFaseDescripcion?: string | null;
  faseId?: number | null;
  faseCodigo?: string | null;
  faseDescripcion?: string | null;
  esFinal?: boolean | null;
  versionFaseEsObligatoria?: boolean | null;
  tipoEvaluacionId: number;
  tipoEvaluacion: string;
  estadoEvaluacionId: number;
  estadoEvaluacion: string;
  intento: number;
  evaluacionPadreId?: number | null;
  usuarioEvaluador: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  motivoReevaluacion?: string | null;
  observacion: string | null;
  resultadoGeneral: boolean | null;
  esReevaluacion?: boolean;
};

export type EvaluacionDetalle = {
  evaluacionResultadoId: number | null;
  versCaractId: number;
  versionFaseId?: number | null;
  versionFaseOrden?: number | null;
  codigoReferencia?: string | null;
  esFinal?: boolean | null;
  ordenGeneral?: number;
  tipoCaractId?: number;
  tipoCaracteristica: string;
  item?: number;
  esInicioGrupo?: boolean;
  fase?: string | null;
  caracteristica: string;
  tipoCriterioId: number | null;
  tipoCriterio: string | null;
  especificacion: string | null;
  valorCuantitativoInicial?: number | null;
  valorCuantitativoFinal?: number | null;
  valorCuantitativoIgual?: number | null;
  valorCualitativo?: string | null;
  unidad: string | null;
  metodoEnsayo: string | null;
  orden: number;
  esObligatorio: boolean;
  tipoResultado: "NUMERICO" | "TEXTO";
  resultadoNumerico: number | null;
  resultadoTexto: string | null;
  resultado?: string | null;
  observacion?: string | null;
  cumple: boolean | null;
  cumpleDescripcion?: string | null;
  tieneResultado?: boolean;
  tieneObservacion?: boolean;
  permiteEditar: boolean;
  evaluacionPadreId?: number | null;
  evaluacionResultadoPadreId?: number | null;
  resultadoTextoAnterior?: string | null;
  resultadoNumericoAnterior?: number | null;
  cumpleAnterior?: boolean | null;
  observacionAnterior?: string | null;
};

export type EvaluacionAvance = {
  totalCaracteristicas: number;
  totalObligatorias: number;
  resultadosRegistrados: number;
  obligatoriasCompletas: number;
  parametrosPendientes?: number;
  porcentajeAvance?: number;
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
  versionFaseId?: number | null;
  versionFaseOrden?: number | null;
  codigoReferencia?: string | null;
  faseCodigo?: string | null;
  esFinal?: boolean | null;
  evaluacionPadreId?: number | null;
  esReevaluacion?: boolean;
  requiereReevaluacion?: boolean;
  siguienteVersionFaseId?: number | null;
  siguienteVersionFaseOrden?: number | null;
  siguienteCodigoReferencia?: string | null;
  tieneSiguienteEtapa?: boolean;
  totalParametros?: number | null;
  totalObligatorios?: number | null;
  obligatoriosEvaluados?: number | null;
  cumplen?: number | null;
  noCumplen?: number | null;
};


export type TerminarEvaluacionResponse = OperacionResponse & {
  totalParametros?: number | null;
  resultadosRegistrados?: number | null;
  resultadosPendientes?: number | null;
};

export type SolicitarReaperturaResponse = OperacionResponse & {
  solicitudReaperturaId: number;
  estadoSolicitud: string;
};

export type SolicitudReaperturaItem = {
  solicitudReaperturaId: number;
  evaluacionId: number;
  loteId: number;
  codigoLote: string;
  productoCodigo: string;
  productoDescripcion: string | null;
  tipoEvaluacionId: number;
  intento: number;
  usuarioEvaluador: string | null;
  motivoSolicitud: string;
  estadoSolicitud: string;
  usuarioSolicitante: string;
  fechaSolicitud: string;
  usuarioRespuesta: string | null;
  fechaRespuesta: string | null;
  observacionRespuesta: string | null;
  leidaPorMi: boolean;
  totalLecturas: number;
  estadoLote: string | null;
  estadoEvaluacion: string | null;
};

export type SolicitudReaperturaLectura = {
  solicitudReaperturaLecturaId: number;
  solicitudReaperturaId: number;
  usuarioLectura: string;
  fechaLectura: string;
};

export type SolicitudReaperturaDetalle = {
  codigoResultado: number;
  mensaje: string;
  solicitudReaperturaId: number;
  evaluacionId: number;
  loteId: number;
  codigoLote: string;
  productoCodigo: string;
  productoDescripcion: string | null;
  tipoEvaluacionId: number;
  intento: number;
  usuarioEvaluador: string | null;
  estadoEvaluacion: string | null;
  estadoLote: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  resultadoGeneral: boolean | null;
  motivoSolicitud: string;
  estadoSolicitud: string;
  usuarioSolicitante: string;
  fechaSolicitud: string;
  usuarioRespuesta: string | null;
  fechaRespuesta: string | null;
  observacionRespuesta: string | null;
  lecturas: SolicitudReaperturaLectura[];
};

export type ResolverReaperturaResponse = OperacionResponse & {
  solicitudReaperturaId: number | null;
  estadoSolicitud: string | null;
};


export type EvaluacionPendienteCalculo = {
  evaluacionId: number;
  loteId: number;
  codigoLote: string;
  productoCodigo: string;
  productoDescripcion: string;
  tipoEvaluacionId: number;
  intento: number;
  usuarioEvaluador: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estadoEvaluacion: string;
  estadoLote: string;
  totalParametros: number;
  resultadosRegistrados: number;
  totalObligatorios: number;
  obligatoriosRegistrados: number;
  parametrosCumplen: number;
  parametrosNoCumplen: number;
  precalculo: string;
  resultadosPendientes: number;
};

export type PrecalculoEvaluacion = EvaluacionPendienteCalculo & {
  accionPropuesta: string;
  esCalculable: boolean;
};

export type PrecalculoDetalle = {
  evaluacionId: number;
  loteId: number;
  codigoLote: string;
  versCaractId: number;
  caracteristicaId: number;
  caracteristicaDescripcion: string;
  tipoCaractId: number;
  tipoCaractDescripcion: string;
  tipoCriterioId: number;
  tipoCriterio: string;
  valorCuantitativoInicial: number | null;
  valorCuantitativoFinal: number | null;
  valorCuantitativoIgual: number | null;
  valorCualitativo: string | null;
  unidad: string | null;
  esObligatorio: boolean;
  orden: number | null;
  evaluacionResultadoId: number | null;
  resultadoNumerico: number | null;
  resultadoTexto: string | null;
  cumple: boolean | null;
  observacion: string | null;
  estadoResultado: string;
  especificacion: string | null;
};

export type PrecalculoEvaluacionesResponse = {
  evaluaciones: PrecalculoEvaluacion[];
  detalle: PrecalculoDetalle[];
};

export type ConsolidacionEvaluacionResultado = {
  evaluacionId: number;
  loteId: number | null;
  codigoLote: string | null;
  productoCodigo: string | null;
  precalculo: string | null;
  accion: string | null;
  procesado: boolean;
  codigoResultado: number;
  mensaje: string;
};
