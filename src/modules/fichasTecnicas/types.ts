export type CrearFichaTecnicaRequest={documentoCodigo:string;documentoDescripcionDocumento:string;productoCodigo:string|null;versionNumero:number|null;versionInicioVigencia:string|null;versionReemplazaAId:number|null;versionNroPaginas:number|null;versionDescripcion:string|null;versionEtOrigenId:number|null};
export type CrearFichaTecnicaResponse={codigoResultado:number;mensaje:string;documentoId:number|null;documentoCodigo:string|null;documentoDescripcionDocumento:string|null;tipoDocumentoId:number|null;tipoDocumentoDescripcion:string|null;productoCodigo:string|null;versionId:number|null;versionNumero:number|null;estVerId:number|null;estadoVersion:string|null;versionInicioVigencia:string|null;versionReemplazaAId:number|null;versionNroPaginas:number|null;versionDescripcion:string|null;versionEtOrigenId:number|null};
export type CaracteristicaFt={versionFtCaracteristicaId:number;versionId:number;versCaractOrigenId:number|null;ordenTecnico:number|null;faseId:number|null;faseCodigo:string|null;faseDescripcion:string|null;versionFaseId:number|null;versionFaseOrden:number|null;caracteristicaId:number;caracteristicaDescripcion:string;tipoCaractId:number|null;tipoCaractDescripcion:string|null;tipoCriterioId:number;tipoCriterioDescripcion:string|null;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorTolerancia:number|null;valorCualitativo:string|null;criterioMostrar:string|null;unidadDeMedida:string|null;metEnsayoId:number|null;metEnsayoDescripcion:string|null;esPropiaFt:boolean;imprimeCertificado:boolean;obligatorioCertificado:boolean;ordenCertificado:number|null;estado:boolean};
export type GuardarCaracteristicaFt={versionFtCaracteristicaId:number|null;caracteristicaId:number;tipoCriterioId:number;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorTolerancia:number|null;valorCualitativo:string|null;unidadDeMedida:string|null;imprimeCertificado:boolean;obligatorioCertificado:boolean;ordenCertificado:number|null};
export type OperacionFt={codigoResultado:number;mensaje:string;versionFtCaracteristicaId?:number|null};

export type FichaTecnicaGestion={versionId:number;documentoId:number;documentoCodigo:string;documentoDescripcionDocumento:string;productoCodigo:string|null;versionNumero:number|null;versionInicioVigencia:string|null;estVerId:number;estadoVersion:string;versionNroPaginas:number|null;versionDescripcion:string|null;cantidadCaracteristicas:number;cantidadParametrosCertificables:number};

export type EliminarFichaTecnicaResponse={codigoResultado:number;mensaje:string;versionId:number};

export type SeccionFt={versionFtSeccionId:number;versionId:number;codigo:string;titulo:string;tipoContenido:"TEXTO"|"LISTA"|"TABLA"|"CARACTERISTICAS";orden:number;visible:boolean;esSistema:boolean;contenido:string|null};
export type OperacionSeccionFt={codigoResultado:number;mensaje:string;versionFtSeccionId?:number|null;versionId?:number|null;orden?:number|null};
export type ReordenarSeccionesFt={secciones:Array<{versionFtSeccionId:number;orden:number}>};

export type AccionWorkflowFt="ENVIAR_REVISION"|"OBSERVAR"|"VERIFICAR"|"PUBLICAR"|"VIGENTAR"|"RETORNAR_BORRADOR";
export type CambiarEstadoFtRequest={accion:AccionWorkflowFt;comentario:string|null};
export type CambiarEstadoFtResponse={codigoResultado:number;mensaje:string;versionId?:number|null;estVerOrigenId?:number|null;estadoOrigen?:string|null;estVerDestinoId?:number|null;estadoDestino?:string|null;accion?:string|null;comentario?:string|null;versionVigenteAnteriorId?:number|null;fechaVigencia?:string|null};
export type HistorialEstadoFt={versionHistorialEstadoId:number;versionId:number;estVerOrigenId:number|null;estadoOrigen:string|null;estVerDestinoId:number;estadoDestino:string;accion:string;comentario:string|null;usuario:string;fecha:string};


export type DeclaracionFt={
 versionFtDeclaracionId:number;versionId:number;codigo:string;titulo:string;descripcion:string|null;orden:number;estado:boolean
};
export type GuardarDeclaracionFt={codigo:string;titulo:string;descripcion:string|null;orden:number};

export type AlergenoFt={
 alergenoId:number;alergenoCodigo:string;alergenoDescripcion:string;orden:number;
 enProducto:boolean;enLinea:boolean;enPlanta:boolean;descripcion:string|null
};
export type GuardarAlergenoFt={
 alergenoId:number;enProducto:boolean;enLinea:boolean;enPlanta:boolean;descripcion:string|null;orden:number
};

export type GrupoCaracteristicaFt={
 tipoCaractId:number;tipoCaractDescripcion:string;versionFtCaracteristicaGrupoId:number|null;
 titulo:string;referencia:string|null;nota:string|null;orden:number|null
};
export type GuardarGrupoCaracteristicaFt={
 titulo:string|null;referencia:string|null;nota:string|null;orden:number|null
};

export type OperacionComplementoFt={
 codigoResultado:number;mensaje:string;versionId?:number|null;cantidad?:number|null;tipoCaractId?:number|null
};
