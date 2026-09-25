export type InformacionGeneralEt = {
  codigoResultado: number; mensaje: string; documentoId: number; documentoCodigo: string;
  documentoDescripcionDocumento: string; productoCodigo: string; productoDescripcion: string;
  versionId: number; versionNumero: number | null; estadoVersion: string; versionInicioVigencia: string | null;
  versionReemplazaAId: number | null; versionNroPaginas: number | null; versionDescripcion: string | null;
  permiteEditar: boolean; permiteEnviarRevision: boolean; permiteRevisar: boolean; permitePublicar: boolean;
};
export type CaracteristicaEt = {
  versCaractId:number; caracteristicaId:number; tipoCaractId:number; tipoCaracteristica:string; caracteristica:string;
  unidad:string|null; metEnsayoId:number|null; metodoEnsayo:string|null; tipoCriterioId:number|null; tipoCriterio:string|null;
  valorCuantitativoInicial:number|null; valorCuantitativoFinal:number|null; valorCuantitativoIgual:number|null;
  valorCualitativo:string|null; faseId:number|null; faseCodigo:string|null; fase:string|null; esObligatorio:boolean; orden:number|null;
};
export type DetalleEt = { informacionGeneral: InformacionGeneralEt; caracteristicas: CaracteristicaEt[]; [key:string]: unknown };
export type ProductoEt={productoCodigo:string;productoDescripcion:string};
export type CaracteristicaCatalogoEt={caracteristicaId:number;caracteristicaDescripcion:string;unidad:string|null;tipoCaractId:number;tipoCaracteristica:string;metEnsayoId:number|null;metodoEnsayo:string|null};
export type CriterioEt={tipoCriterioId:number;tipoCriterio:string};
export type FaseEt={faseId:number;faseCodigo:string;faseDescripcion:string;estado:string};
export type CatalogosEt={productos:ProductoEt[];caracteristicas:CaracteristicaCatalogoEt[];tiposCriterio:CriterioEt[];fases:FaseEt[];tiposCaracteristica:unknown[];metodosEnsayo:unknown[]};
export type GuardarCaracteristicaEt={versCaractId:number|null;caracteristicaId:number;tipoCriterioId:number;valorCuantitativoInicial:number|null;valorCuantitativoFinal:number|null;valorCuantitativoIgual:number|null;valorCualitativo:string|null;faseId:number|null;esObligatorio:boolean;orden:number;usuario:string};
export type OperacionEt={codigoResultado:number;mensaje:string;versCaractId?:number|null};
