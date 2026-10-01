export type InformacionGeneralEt = {
  codigoResultado: number; mensaje: string; documentoId: number; documentoCodigo: string;
  documentoDescripcionDocumento: string; productoCodigo: string; productoDescripcion: string;
  versionId: number; versionNumero: number | null; estadoVersion: string; versionInicioVigencia: string | null;
  versionReemplazaAId: number | null; versionNroPaginas: number | null; versionDescripcion: string | null;
  envyEmbDescripcion?: string|null; almacyDistDescripcion?: string|null; vidaUtilDescripcion?: string|null; descongelamientoDescripcion?: string|null;
  archivoOriginalUrl?: string|null; archivoOriginalNombre?: string|null;
  permiteEditar: boolean; permiteEnviarRevision: boolean; permiteRevisar: boolean; permitePublicar: boolean;
};
export type CaracteristicaEt = {
  versCaractId:number; caracteristicaId:number; tipoCaractId:number; tipoCaracteristica:string; caracteristica:string;
  unidad:string|null; metEnsayoId:number|null; metodoEnsayo:string|null; tipoCriterioId:number|null; tipoCriterio:string|null;
  valorCuantitativoInicial:number|null; valorCuantitativoFinal:number|null; valorCuantitativoIgual:number|null;
  valorCualitativo:string|null; faseId:number|null; faseCodigo:string|null; fase:string|null; esObligatorio:boolean; orden:number|null;
};
export type SeccionEt={versSeccId:number;versionId:number;seccionId:number;seccionDescripcion:string;orden:number|null;idTipoSeccion:number|null;tipoSeccionDescripcion:string|null;esBase:boolean;puedeEliminarse:boolean;permiteReordenar:boolean;icono:string|null};
export type ResponsableEt={tipoResponsabilidad:string;idRelacion:number;usuarioDni:string;usuarioNombresApellidos:string;cargoId:number|null;usuarioCargoHistorialId:number|null;cargoDescripcion?:string|null;cargoActual?:boolean|null};
export type IngredienteEt={versIngrId:number;ingredienteId:number;ingredienteDescripcion:string;unidadDeMedida:string|null;versIngrValor:number|null;idTipoContenido:number|null;tipoContenidoCodigo:string|null;tipoContenido:string|null;orden:number|null};
export type RecetaEt={versRectId:number;recetaId:number;recetaDescripcion:string;idTipoContenido:number|null;tipoContenidoCodigo:string|null;tipoContenido:string|null;orden:number|null};
export type ProcedimientoEt={versProcId:number;procPrepId:number;procPrepDescripcion:string;idTipoContenido:number|null;tipoContenidoCodigo:string|null;tipoContenido:string|null;orden:number|null};
export type TratamientoEt={versTratConsId:number;tratConservId:number;tratConservDescripcion:string};
export type ParametroTratamientoEt={versParamTratId:number;versTratConsId:number;parametroTratId:number;paramTratDescripcion:string;paramTratUnidadDeMedida:string|null;tipoCriterioId:number;tipoCriterio:string;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorCualitativo:string|null;orden:number|null};
export type TextoOrdenadoEt={orden:number|null;[key:string]:unknown};
export type PresentacionGenesisDetalleEt={versionKardexId:number;versionId:number;kardex:number;codigoGenesis:string;nombreGenesis:string|null;descripcionGenesis:string|null;estadoGenesis:number|null;estado:string|null};
export type DetalleEt = {
 informacionGeneral:InformacionGeneralEt;secciones:SeccionEt[];responsables:ResponsableEt[];ingredientes:IngredienteEt[];recetas:RecetaEt[];procedimientos:ProcedimientoEt[];
 tratamientos:TratamientoEt[];parametrosTratamiento:ParametroTratamientoEt[];caracteristicas:CaracteristicaEt[];
 instrucciones:Array<{versInstrId:number;instruccionId:number;instruccionDescripcion:string;orden:number|null}>;
 contenidoRotulado:Array<{versContRotId:number;contRotuladoId:number;contRotuladoDescripcion:string;orden:number|null}>;
 cambiosVersion:Array<{versCambId:number;cambVersiId:number;cambVersNumeroDeRevision:number;cambVersFechaDeActualizacion:string|null;cambVersDescripcion:string}>;
 anexos:Array<{versionAnexoId:number;anexoId:number;anexoDescripcion:string}>;
 historial:Array<{versionHistorialEstadoId:number;estadoOrigen:string|null;estadoDestino:string;accion:string;comentario:string|null;fecha:string}>;
 presentacionesGenesis:PresentacionGenesisDetalleEt[];
};
export type ProductoEt={productoCodigo:string;productoDescripcion:string};
export type CaracteristicaCatalogoEt={caracteristicaId:number;caracteristicaDescripcion:string;unidad:string|null;tipoCaractId:number;tipoCaracteristica:string;metEnsayoId:number|null;metodoEnsayo:string|null};
export type CriterioEt={tipoCriterioId:number;tipoCriterio:string};
export type FaseEt={faseId:number;faseCodigo:string;faseDescripcion:string;estado:string};
export type CatalogosEt={caracteristicas:CaracteristicaCatalogoEt[];tiposCriterio:CriterioEt[];fases:FaseEt[];tiposCaracteristica:unknown[];metodosEnsayo:unknown[]};
export type TipoContenidoBaseEt="DESCRIPCION"|"ENVASE_EMBALAJE"|"ALMACENAMIENTO_DISTRIBUCION"|"VIDA_UTIL"|"DESCONGELAMIENTO";
export type GuardarContenidoBaseEt={tipoContenido:TipoContenidoBaseEt;contenido:string|null};

export type ResponsableCatalogoEt={usuarioCargoHistorialId:number;usuarioDni:string;usuarioNombresApellidos:string;cargoId:number;cargoDescripcion:string;cargoActual:boolean;fechaInicio:string|null;fechaFin:string|null};
export type GuardarResponsablesEt={elaboradoPor:number[];revisadoPor:number[];aprobadoPor:number[]};

export type IngredienteCatalogoEt={ingredienteId:number;ingredienteDescripcion:string;unidadDeMedida:string|null};
export type TipoContenidoCatalogoEt={idTipoContenido:number;codigo:string;nombre:string;descripcion:string|null};
export type CatalogosIngredientesEt={ingredientes:IngredienteCatalogoEt[];tiposContenido:TipoContenidoCatalogoEt[]};
export type GuardarIngredienteEt={ingredienteId:number;unidadDeMedida:string|null;valor:number|null;idTipoContenido:number|null;orden:number};
export type GuardarIngredientesEt={ingredientes:GuardarIngredienteEt[]};

export type GuardarRecetaEt={descripcion:string;idTipoContenido:number|null;orden:number};
export type GuardarRecetasEt={recetas:GuardarRecetaEt[]};

export type GuardarProcedimientoEt={descripcion:string;idTipoContenido:number|null;orden:number};
export type GuardarProcedimientosEt={procedimientos:GuardarProcedimientoEt[]};

export type TratamientoCatalogoEt={tratConservId:number;tratConservDescripcion:string};
export type ParametroTratamientoCatalogoEt={paramTratId:number;paramTratDescripcion:string;paramTratUnidadDeMedida:string|null};
export type TipoCriterioTratamientoCatalogoEt={tipoCriterioId:number;tipCritDescripcion:string};
export type CatalogosTratamientosEt={tratamientos:TratamientoCatalogoEt[];parametros:ParametroTratamientoCatalogoEt[];tiposCriterio:TipoCriterioTratamientoCatalogoEt[]};
export type GuardarParametroTratamientoEt={parametroTratId:number;tipoCriterioId:number;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorCualitativo:string|null;orden:number};
export type GuardarTratamientoEt={tratConservId:number;parametros:GuardarParametroTratamientoEt[]};
export type GuardarTratamientosEt={tratamientos:GuardarTratamientoEt[]};

export type GuardarInstruccionEt={descripcion:string;orden:number};
export type GuardarInstruccionesEt={instrucciones:GuardarInstruccionEt[]};

export type ContenidoRotuladoCatalogo={contRotuladoId:number;contRotuladoDescripcion:string};
export type GuardarContenidoRotuladoEt={contenidoRotulado:{contRotuladoId:number;orden:number}[]};

export type GuardarAnexosEt={anexos:{descripcion:string}[]};

export type GuardarCambioEt={numeroRevision:number;fechaActualizacion:string;descripcion:string};
export type GuardarCambiosEt={cambios:GuardarCambioEt[]};

export type GuardarCaracteristicaEt={versCaractId:number|null;caracteristicaId:number;tipoCriterioId:number;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorCualitativo:string|null;faseId:number|null;esObligatorio:boolean;orden:number};
export type OperacionEt={codigoResultado:number;mensaje:string;versCaractId?:number|null};

export type EspecificacionTecnicaListado={versionId:number;documentoId:number;documentoCodigo:string;documentoDescripcionDocumento:string;productoCodigo:string;productoDescripcion:string|null;versionNumero:number|null;versionInicioVigencia:string|null;versionNroPaginas:number|null;estVerId:number;estadoVersion:string;audUsuarioCreacion:string|null;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;permiteEditar:boolean};

export type CrearEtSeccion={seccionId:number;orden:number};
export type PresentacionGenesisEt={kardex:number;codigoGenesis:string};
export type CrearEspecificacionTecnica={documentoCodigo:string;documentoDescripcionDocumento:string;productoCodigo:string;presentacionesGenesis:PresentacionGenesisEt[];versionNumero:number;versionInicioVigencia:string|null;versionReemplazaAId:number|null;versionNroPaginas:number|null;secciones:CrearEtSeccion[]};
export type CrearEspecificacionTecnicaResponse=OperacionEt&{documentoId?:number|null;versionId?:number|null;documentoCodigo?:string|null;productoCodigo?:string|null;versionNumero?:number|null;estadoVersion?:string|null};

export type SeccionDisponibleEt={seccionId:number;seccionDescripcion:string;idTipoSeccion:number|null;tipoSeccion:string|null;ordenDefault:number;esBase:boolean;puedeEliminarse:boolean;permiteReordenar:boolean;icono:string|null};
export type TipoSeccionEt={idTipoSeccion:number;descripcion:string};
export type SeccionesEtCatalogo={secciones:SeccionDisponibleEt[];tiposSeccion:TipoSeccionEt[]};
export type CrearSeccionEt={seccionDescripcion:string;idTipoSeccion:number};
export type CrearSeccionEtResponse=OperacionEt&{seccionId?:number|null;seccionDescripcion?:string|null;idTipoSeccion?:number|null;ordenDefault?:number|null;esBase?:boolean|null;puedeEliminarse?:boolean|null;permiteReordenar?:boolean|null};

export type ContenidoSeccionEt={versionSeccionContenidoId:number;versSeccId:number;seccionId:number;seccionDescripcion:string;idTipoSeccion:number|null;contenido:string|null};
export type AgregarSeccionVersionEt={seccionId:number;orden:number|null};
export type ReordenarSeccionesVersionEt={secciones:Array<{versSeccId:number;orden:number}>};

export type GuardarInformacionGeneralEt={documentoDescripcionDocumento:string;versionNumero:number|null;versionInicioVigencia:string|null;versionReemplazaAId:number|null;versionNroPaginas:number|null;versionDescripcion:string|null};

export type AccionWorkflowEt="ENVIAR_REVISION"|"OBSERVAR"|"VERIFICAR"|"PUBLICAR"|"VIGENTAR";
export type CambiarEstadoEt={accion:AccionWorkflowEt;comentario:string|null};
export type CambiarEstadoEtResponse=OperacionEt&{versionId?:number|null;estVerOrigenId?:number|null;estadoOrigen?:string|null;estVerDestinoId?:number|null;estadoDestino?:string|null;accion?:string|null;comentario?:string|null;versionVigenteAnteriorId?:number|null;fechaVigencia?:string|null};

export type VersionReemplazableEt={versionId:number;documentoCodigo:string;versionNumero:number;versionInicioVigencia:string|null;versionFinVigencia:string|null;estadoVersion:string};
