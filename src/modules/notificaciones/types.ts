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
  cantidadVecesModal:number;
  atendida:boolean;
  fechaAtencion:string|null;
  mostrarCampana:boolean;
  mostrarModal:boolean;
  politicaModal:string;
  maximoVecesModal:number|null;
  prioridad:string;
  mostrarEnCampana:boolean;
  mostrarEnModal:boolean;
  audFechaCreacion:string;
};

export type OperacionNotificacion = {
  codigoResultado:number;
  mensaje:string;
  cantidadActualizada?:number|null;
};
