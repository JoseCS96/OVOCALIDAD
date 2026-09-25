export type Notificacion = {
  notificacionId:number;
  tipoNotificacion:string;
  titulo:string;
  mensaje:string;
  entidadTipo:string|null;
  entidadId:number|null;
  urlDestino:string|null;
  leida:boolean;
  fechaLectura:string|null;
  mostradaModal:boolean;
  fechaMostradaModal:string|null;
  audFechaCreacion:string;
};

export type OperacionNotificacion = {
  codigoResultado:number;
  mensaje:string;
  cantidadActualizada?:number|null;
};
