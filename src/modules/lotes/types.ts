export type LoteListado = {
  loteId: number; codigoLote: string; productoCodigo: string; productoDescripcion: string;
  correlativo: number; fechaHoraProduccion: string; numeroCorrelativoId: number;
  naturalezaId: number; naturalezaCodigo: string; naturalezaDescripcion: string;
  faseId: number; faseCodigo: string; faseDescripcion: string;
  lineaOrigenId: number; lineaOrigenCodigo: string; lineaOrigenDescripcion: string;
  versionId: number; versionNumero: number; versionInicioVigencia: string; versionFinVigencia: string | null;
  estadoLoteId: number; estadoLoteCodigo: string; estadoLoteDescripcion: string;
  evaluacionId: number | null; evaluacionPadreId: number | null; tipoEvaluacionId: number | null;
  intentoEvaluacion: number | null; estadoEvaluacionId: number | null; estadoEvaluacionCodigo: string | null;
  estadoEvaluacionDescripcion: string | null; resultadoGeneral: boolean | null;
  fechaInicioEvaluacion: string | null; fechaFinEvaluacion: string | null; usuarioEvaluador: string | null;
  totalEvaluaciones: number; evaluacionesTerminadas: number; totalParametrosEvaluacion: number;
  resultadosRegistrados: number; parametrosPendientes: number;
  porcentajeAvance: number; porcentajeFaltante: number;
  observacion: string | null; estado: string; audFechaCreacion: string; audFechaActualizacion: string | null;
};

export type LotesFiltros = {
  codigoLote?: string; productoCodigo?: string; estadoLoteId?: number;
  estadoEvaluacionId?: number; fechaDesde?: string; fechaHasta?: string;
};

export type ProductoCatalogo = { codigo: string; descripcion: string };
export type CatalogoLote = { id: number; codigo: string; descripcion: string };
export type CatalogosLote = {
  productos: ProductoCatalogo[];
  naturalezas: CatalogoLote[];
  fases: CatalogoLote[];
  lineasOrigen: CatalogoLote[];
};

export type GenerarLoteRequest = {
  productoCodigo: string; naturalezaId: number; faseId: number;
  lineaOrigenId: number; observacion?: string | null; usuario: string;
};

export type GenerarLoteResponse = {
  resultado: { codigoResultado: number; mensaje: string };
  lote: { loteId: number; codigoLote: string; productoCodigo: string; productoDescripcion: string } | null;
};


export type LoteEvaluacion = {
  evaluacionId: number; loteId: number; evaluacionPadreId: number | null;
  tipoEvaluacionId: number; tipoEvaluacionCodigo: string; tipoEvaluacionDescripcion: string;
  estadoEvaluacionId: number; estadoEvaluacionCodigo: string; estadoEvaluacionDescripcion: string;
  intento: number; resultadoGeneral: boolean | null; resultadoDescripcion: string;
  fechaInicio: string; fechaFin: string | null; motivoReevaluacion: string | null; observacion: string | null;
  usuarioEvaluador: string | null; resultadosRegistrados: number; totalParametros: number;
  parametrosPendientes: number; porcentajeAvance: number; estado: string;
  audFechaCreacion: string; audFechaActualizacion: string | null;
};

export type LoteEvaluacionesResumen = {
  totalEvaluaciones: number; evaluacionesPendientes: number; evaluacionesEnProceso: number;
  evaluacionesTerminadas: number; evaluacionesConformes: number; evaluacionesNoConformes: number;
};

export type DetalleLote = {
  lote: LoteListado;
  evaluaciones: LoteEvaluacion[];
  resumen: LoteEvaluacionesResumen;
};
