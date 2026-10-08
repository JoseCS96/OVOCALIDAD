export type PlantillaLista={
 certificadoPlantillaId:number;
 versionFtId:number;
 nombre:string;
 descripcion:string|null;
 esPredeterminada:boolean;
 documentoId:number;
 documentoCodigo:string;
 documentoDescripcionDocumento:string;
 productoCodigo:string|null;
 versionNumero:number|null;
 estVerId:number;
 cantidadSecciones:number;
 cantidadCaracteristicas:number;
};

export type ParametroFt={
 versionFtCaracteristicaId:number;
 versionId:number;
 caracteristicaId:number;
 determinacion:string;
 tipoCaractId:number|null;
 tipoCaractDescripcion:string|null;
 faseId:number|null;
 versionFaseId:number|null;
 faseCodigo:string|null;
 faseDescripcion:string|null;
 tipoCriterioId:number;
 valorCuantitativoInicial:number|null;
 valorCuantitativoFinal:number|null;
 valorCuantitativoIgual:number|null;
 valorCualitativo:string|null;
 unidadDeMedida:string|null;
 metEnsayoId:number|null;
 metEnsayoDescripcion:string|null;
 obligatorioCertificado:boolean;
 ordenCertificado:number;
};

export type Seccion={
 certificadoPlantillaSeccionId:number;
 certificadoPlantillaId:number;
 certificadoSeccionId:number;
 seccionCodigo:string;
 seccionDescripcion:string;
 tipoContenido:string;
 puedeEliminarse:boolean;
 permiteReordenar:boolean;
 orden:number;
 visible:boolean;
 contenido:string|null;
};

export type ResultadoPlantilla={
 certificadoPlantillaResultadoId:number;
 certificadoPlantillaSeccionId:number;
 titulo:string;
 orden:number;
 visible:boolean;
 modoSeleccion:"MANUAL"|"TIPO"|"FASE"|"TIPO_FASE";
 versionFaseId:number|null;
 faseId:number|null;
 faseCodigo:string|null;
 faseDescripcion:string|null;
 tipoCaractId:number|null;
 tipoCaractDescripcion:string|null;
};

export type CaracteristicaPlantilla={
 certificadoPlantillaResultadoCaracteristicaId:number;
 certificadoPlantillaResultadoId:number;
 versionFtCaracteristicaId:number;
 caracteristicaId:number;
 determinacion:string;
 tipoCaractId:number|null;
 tipoCaractDescripcion:string|null;
 faseId:number|null;
 versionFaseId:number|null;
 faseCodigo:string|null;
 faseDescripcion:string|null;
 obligatorioCertificado:boolean;
 orden:number;
};

export type PlantillaDetalle={
 certificadoPlantillaId:number;
 versionFtId:number;
 nombre:string;
 descripcion:string|null;
 esPredeterminada:boolean;
 documentoCodigo:string;
 documentoDescripcionDocumento:string;
 productoCodigo:string|null;
 versionNumero:number|null;
 estVerId:number;
 estadoVersionFt:string;
 secciones:Seccion[];
 resultados:ResultadoPlantilla[];
 caracteristicas:CaracteristicaPlantilla[];
};

export type OperacionPlantilla={
 codigoResultado:number;
 mensaje:string;
 certificadoPlantillaId:number;
};

export type CaracteristicaDiseno={
 versionFtCaracteristicaId:number;
 orden:number;
};

export type ResultadoDiseno={
 titulo:string;
 orden:number;
 visible:boolean;
 modoSeleccion:"MANUAL"|"TIPO"|"FASE"|"TIPO_FASE";
 versionFaseId:number|null;
 tipoCaractId:number|null;
 caracteristicas:CaracteristicaDiseno[];
};

export type SeccionDiseno={
 certificadoSeccionId:number;
 seccionCodigo:string;
 seccionDescripcion:string;
 tipoContenido:string;
 puedeEliminarse:boolean;
 permiteReordenar:boolean;
 orden:number;
 visible:boolean;
 contenido:string|null;
 resultados:ResultadoDiseno[];
};

export type FichaTecnicaCertificado={
 versionId:number;
 documentoId:number;
 documentoCodigo:string;
 documentoDescripcionDocumento:string;
 productoCodigo:string|null;
 versionNumero:number|null;
 versionInicioVigencia:string|null;
 estVerId:number;
 estadoVersion:string;
 cantidadParametrosCertificables:number;
};

export type CertificadoEmpresa={
 certificadoEmpresaId:number;
 razonSocial:string;
 nombreComercial:string|null;
 direccion:string|null;
 telefono:string|null;
 fax:string|null;
 correo:string|null;
 sitioWeb:string|null;
 ruc:string|null;
 estado:boolean;
 audUsuarioCreacion:string;
 audFechaCreacion:string;
 audUsuarioModificacion:string|null;
 audFechaActualizacion:string|null;
};

export type GuardarCertificadoEmpresa={
 razonSocial:string;
 nombreComercial:string|null;
 direccion:string|null;
 telefono:string|null;
 fax:string|null;
 correo:string|null;
 sitioWeb:string|null;
 ruc:string|null;
};

export type OperacionEmpresaCertificado={
 codigoResultado:number;
 mensaje:string;
 certificadoEmpresaId:number;
};


export type CertificadoCabecera={
 certificadoId:number|null;
 loteId:number;
 codigoLote:string;
 productoCodigo:string;
 productoDescripcion:string;
 fechaHoraProduccion:string;
 certificadoPlantillaId:number;
 plantillaNombre:string;
 versionFtId:number;
 documentoCodigo:string;
 versionNumero:number|null;
 numeroCertificado:string|null;
 fechaEmision:string;
 estado:string;
};

export type CertificadoSeccionVista={
 tipoSeccion:string;
 tituloSeccion:string|null;
 ordenSeccion:number;
 contenido:string|null;
};

export type CertificadoResultadoVista={
 tituloInforme:string;
 ordenInforme:number;
 ordenDetalle:number;
 caracteristicaId:number|null;
 determinacion:string;
 resultado:string|null;
 especificacion:string|null;
 unidadDeMedida:string|null;
 metodoEnsayo:string|null;
};

export type CertificadoVista={
 cabecera:CertificadoCabecera;
 secciones:CertificadoSeccionVista[];
 resultados:CertificadoResultadoVista[];
};

export type EmitirCertificadoResponse={
 codigoResultado:number;
 mensaje:string;
 certificadoId:number;
 numeroCertificado:string;
 fechaEmision:string;
};
