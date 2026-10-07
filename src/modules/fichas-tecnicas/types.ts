export type SeccionFt={
  versionFtSeccionId:number;versionId:number;codigo:string;titulo:string;tipoContenido:string;orden:number;
  visible:boolean;esSistema:boolean;contenido:string|null;
};

export type CaracteristicaFt={
  codigoResultado:number;versionFtCaracteristicaId:number;versionFtId:number;versCaractOrigenId:number|null;
  ordenTecnico:number|null;faseId:number|null;faseCodigo:string|null;faseDescripcion:string|null;
  versionFaseId:number|null;versionFaseOrden:number|null;tipoCaractId:number|null;
  tipoCaracteristicaDescripcion:string|null;caracteristicaId:number;caracteristicaDescripcion:string;
  unidadCatalogo:string|null;unidadDeMedida:string|null;tipoCriterioId:number;tipoCriterioDescripcion:string|null;
  valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;
  valorCualitativo:string|null;criterioMostrar:string|null;metEnsayoId:number|null;metodoEnsayoDescripcion:string|null;
  imprimeCertificado:boolean;obligatorioCertificado:boolean;ordenCertificado:number|null;
};

export type OperacionFt={
  codigoResultado:number;mensaje:string;versionFtSeccionId?:number|null;versionFtCaracteristicaId?:number|null;
  versionId?:number|null;versionFtId?:number|null;
};

export type GuardarSeccionFt={titulo:string;contenido:string|null;visible:boolean;usuario:string};
export type AgregarSeccionFt={titulo:string;tipoContenido:"TEXTO"|"LISTA"|"TABLA";orden:number|null;usuario:string};
export type ReordenarSeccionesFt={secciones:Array<{versionFtSeccionId:number;orden:number}>;usuario:string};
export type GuardarCaracteristicaFt={
  tipoCriterioId:number;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;
  valorCuantitativoIgual:number|null;valorCualitativo:string|null;unidadDeMedida:string|null;
  imprimeCertificado:boolean;obligatorioCertificado:boolean;ordenCertificado:number|null;usuario:string;
};
