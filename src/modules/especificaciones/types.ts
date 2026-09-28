export type InformacionGeneralEt = {
  codigoResultado: number; mensaje: string; documentoId: number; documentoCodigo: string;
  documentoDescripcionDocumento: string; productoCodigo: string; productoDescripcion: string;
  versionId: number; versionNumero: number | null; estadoVersion: string; versionInicioVigencia: string | null;
  versionReemplazaAId: number | null; versionNroPaginas: number | null; versionDescripcion: string | null;
  envyEmbDescripcion?: string|null; almacyDistDescripcion?: string|null; vidaUtilDescripcion?: string|null; descongelamientoDescripcion?: string|null;
  permiteEditar: boolean; permiteEnviarRevision: boolean; permiteRevisar: boolean; permitePublicar: boolean;
};
export type CaracteristicaEt = {
  versCaractId:number; caracteristicaId:number; tipoCaractId:number; tipoCaracteristica:string; caracteristica:string;
  unidad:string|null; metEnsayoId:number|null; metodoEnsayo:string|null; tipoCriterioId:number|null; tipoCriterio:string|null;
  valorCuantitativoInicial:number|null; valorCuantitativoFinal:number|null; valorCuantitativoIgual:number|null;
  valorCualitativo:string|null; faseId:number|null; faseCodigo:string|null; fase:string|null; esObligatorio:boolean; orden:number|null;
};
export type SeccionEt={versSeccId:number;versionId:number;seccionId:number;seccionDescripcion:string;orden:number|null;idTipoSeccion:number|null;tipoSeccionDescripcion:string|null;esBase:boolean;puedeEliminarse:boolean;permiteReordenar:boolean;icono:string|null};
export type ResponsableEt={tipoResponsabilidad:string;idRelacion:number;usuarioDni:string;usuarioNombresApellidos:string;cargoId:number|null};
export type IngredienteEt={versIngrId:number;ingredienteId:number;ingredienteDescripcion:string;unidadDeMedida:string|null;versIngrValor:number|null;idTipoContenido:number|null;tipoContenidoCodigo:string|null;tipoContenido:string|null;orden:number|null};
export type RecetaEt={versRectId:number;recetaId:number;recetaDescripcion:string;idTipoContenido:number|null;tipoContenidoCodigo:string|null;tipoContenido:string|null;orden:number|null};
export type ProcedimientoEt={versProcId:number;procPrepId:number;procPrepDescripcion:string;idTipoContenido:number|null;tipoContenidoCodigo:string|null;tipoContenido:string|null;orden:number|null};
export type TratamientoEt={versTratConsId:number;tratConservId:number;tratConservDescripcion:string};
export type ParametroTratamientoEt={versParamTratId:number;versTratConsId:number;parametroTratId:number;paramTratDescripcion:string;paramTratUnidadDeMedida:string|null;tipoCriterioId:number;tipoCriterio:string;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorCualitativo:string|null;orden:number|null};
export type TextoOrdenadoEt={orden:number|null;[key:string]:unknown};
export type DetalleEt = {
 informacionGeneral:InformacionGeneralEt;secciones:SeccionEt[];responsables:ResponsableEt[];ingredientes:IngredienteEt[];recetas:RecetaEt[];procedimientos:ProcedimientoEt[];
 tratamientos:TratamientoEt[];parametrosTratamiento:ParametroTratamientoEt[];caracteristicas:CaracteristicaEt[];
 instrucciones:Array<{versInstrId:number;instruccionId:number;instruccionDescripcion:string;orden:number|null}>;
 contenidoRotulado:Array<{versContRotId:number;contRotuladoId:number;contRotuladoDescripcion:string;orden:number|null}>;
 cambiosVersion:Array<{versCambId:number;cambVersiId:number;cambVersNumeroDeRevision:number;cambVersFechaDeActualizacion:string|null;cambVersDescripcion:string}>;
 anexos:Array<{versionAnexoId:number;anexoId:number;anexoDescripcion:string}>;
 historial:Array<{versionHistorialEstadoId:number;estadoOrigen:string|null;estadoDestino:string;accion:string;comentario:string|null;usuario:string;fecha:string}>;
};
export type ProductoEt={productoCodigo:string;productoDescripcion:string};
export type CaracteristicaCatalogoEt={caracteristicaId:number;caracteristicaDescripcion:string;unidad:string|null;tipoCaractId:number;tipoCaracteristica:string;metEnsayoId:number|null;metodoEnsayo:string|null};
export type CriterioEt={tipoCriterioId:number;tipoCriterio:string};
export type FaseEt={faseId:number;faseCodigo:string;faseDescripcion:string;estado:string};
export type CatalogosEt={productos:ProductoEt[];caracteristicas:CaracteristicaCatalogoEt[];tiposCriterio:CriterioEt[];fases:FaseEt[];tiposCaracteristica:unknown[];metodosEnsayo:unknown[]};
export type GuardarCaracteristicaEt={versCaractId:number|null;caracteristicaId:number;tipoCriterioId:number;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorCualitativo:string|null;faseId:number|null;esObligatorio:boolean;orden:number;usuario:string};
export type OperacionEt={codigoResultado:number;mensaje:string;versCaractId?:number|null};

export type EspecificacionTecnicaListado={versionId:number;documentoId:number;documentoCodigo:string;documentoDescripcionDocumento:string;productoCodigo:string;productoDescripcion:string|null;versionNumero:number|null;versionInicioVigencia:string|null;versionNroPaginas:number|null;estVerId:number;estadoVersion:string;audUsuarioCreacion:string|null;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;permiteEditar:boolean};

export type CrearEtSeccion={seccionId:number;orden:number};
export type CrearEspecificacionTecnica={documentoCodigo:string;documentoDescripcionDocumento:string;productoCodigo:string;versionNumero:number;versionInicioVigencia:string|null;versionReemplazaAId:number|null;versionNroPaginas:number|null;secciones:CrearEtSeccion[];usuario:string};
export type CrearEspecificacionTecnicaResponse=OperacionEt&{documentoId?:number|null;versionId?:number|null;documentoCodigo?:string|null;productoCodigo?:string|null;versionNumero?:number|null;estadoVersion?:string|null};

export type SeccionDisponibleEt={seccionId:number;seccionDescripcion:string;idTipoSeccion:number|null;tipoSeccion:string|null;ordenDefault:number;esBase:boolean;puedeEliminarse:boolean;permiteReordenar:boolean;icono:string|null};
export type TipoSeccionEt={idTipoSeccion:number;descripcion:string};
export type SeccionesEtCatalogo={secciones:SeccionDisponibleEt[];tiposSeccion:TipoSeccionEt[]};
export type CrearSeccionEt={seccionDescripcion:string;idTipoSeccion:number;usuario:string};
export type CrearSeccionEtResponse=OperacionEt&{seccionId?:number|null;seccionDescripcion?:string|null;idTipoSeccion?:number|null;ordenDefault?:number|null;esBase?:boolean|null;puedeEliminarse?:boolean|null;permiteReordenar?:boolean|null};

export type ContenidoSeccionEt={versionSeccionContenidoId:number;versSeccId:number;seccionId:number;seccionDescripcion:string;idTipoSeccion:number|null;contenido:string|null};
export type AgregarSeccionVersionEt={seccionId:number;orden:number|null;usuario:string};
export type ReordenarSeccionesVersionEt={secciones:Array<{versSeccId:number;orden:number}>;usuario:string};

export type GuardarInformacionGeneralEt={documentoDescripcionDocumento:string;productoCodigo:string;versionNumero:number|null;versionInicioVigencia:string|null;versionReemplazaAId:number|null;versionNroPaginas:number|null;versionDescripcion:string|null;usuario:string};

export type AccionWorkflowEt="ENVIAR_REVISION"|"OBSERVAR"|"VERIFICAR"|"PUBLICAR";
export type CambiarEstadoEt={accion:AccionWorkflowEt;comentario:string|null;usuario:string};
export type CambiarEstadoEtResponse=OperacionEt&{versionId?:number|null;estVerOrigenId?:number|null;estadoOrigen?:string|null;estVerDestinoId?:number|null;estadoDestino?:string|null;accion?:string|null;comentario?:string|null};
