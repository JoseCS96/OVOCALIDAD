export type TrazabilidadLote = {
  lote: TrazabilidadCabecera;
  etapas: TrazabilidadEtapa[];
  evaluaciones: TrazabilidadEvaluacion[];
  resultados: TrazabilidadResultado[];
  historialEstados: TrazabilidadEstado[];
};
export type TrazabilidadCabecera = {
  loteId:number; codigoLote:string; codigoGenesis:string|null; productoCodigo:string|null; productoDescripcion:string|null;
  fechaHoraProduccion:string; versionId:number; versionNumero:number; documentoId:number; documentoCodigo:string;
  documentoDescripcionDocumento:string; estadoLoteId:number; estadoLoteCodigo:string; estadoLoteDescripcion:string;
  observacion:string|null; audUsuarioCreacion:string|null; audFechaCreacion:string; audUsuarioModificacion:string|null; audFechaActualizacion:string|null;
};
export type TrazabilidadEtapa = { versionFaseId:number; orden:number; codigoReferencia:string; faseId:number; faseCodigo:string; faseDescripcion:string; esFinal:boolean; esObligatoria:boolean; cantidadCaracteristicas:number };
export type TrazabilidadEvaluacion = {
  evaluacionId:number; evaluacionPadreId:number|null; intento:number; versionFaseId:number|null; etapaOrden:number|null; codigoReferencia:string|null;
  faseCodigo:string|null; faseDescripcion:string|null; esFinal:boolean|null; tipoEvaluacionId:number; tipoEvaluacionCodigo:string; tipoEvaluacionDescripcion:string;
  estadoEvaluacionId:number; estadoEvaluacionCodigo:string; estadoEvaluacionDescripcion:string; resultadoGeneral:boolean|null; resultadoDescripcion:string;
  usuarioEvaluador:string|null; fechaInicio:string|null; fechaFin:string|null; motivoReevaluacion:string|null; observacion:string|null;
  audUsuarioCreacion:string|null; audFechaCreacion:string; audUsuarioModificacion:string|null; audFechaActualizacion:string|null;
};
export type TrazabilidadResultado = {
  evaluacionResultadoId:number; evaluacionId:number; intento:number; versionFaseId:number|null; etapaOrden:number|null; codigoReferencia:string|null;
  versCaractId:number; caracteristicaId:number; caracteristica:string; tipoCriterio:string; valorCuantitativoInicial:number|null; valorCuantitativoFinal:number|null;
  valorCuantitativoIgual:number|null; valorCualitativo:string|null; unidadDeMedida:string|null; resultadoNumerico:number|null; resultadoTexto:string|null;
  cumple:boolean|null; fechaResultado:string; observacion:string|null; audUsuarioCreacion:string|null; audFechaCreacion:string;
  audUsuarioModificacion:string|null; audFechaActualizacion:string|null;
};
export type TrazabilidadEstado = { loteHistorialEstadoId:number; loteId:number; estadoLoteOrigenId:number|null; estadoOrigen:string|null; estadoLoteDestinoId:number; estadoDestino:string; accion:string; comentario:string|null; usuario:string; fecha:string };
