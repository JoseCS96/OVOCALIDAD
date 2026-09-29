import { api } from "@/lib/api";

export type IngredienteMantenimiento={
 ingredienteId:number;ingredienteDescripcion:string;unidadDeMedida:string|null;estado:boolean;
 audUsuarioCreacion:string;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;tieneUso:boolean
};
export type OperacionIngrediente={codigoResultado:number;mensaje:string;ingredienteId?:number;estado?:boolean};
function validar(x:OperacionIngrediente){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarIngredientes(params?:{busqueda?:string;estado?:boolean}){const {data}=await api.get<IngredienteMantenimiento[]>("/api/mantenimientos/ingredientes",{params});return data}
export async function crearIngrediente(request:{ingredienteDescripcion:string;unidadDeMedida:string|null}){const {data}=await api.post<OperacionIngrediente>("/api/mantenimientos/ingredientes",request);return validar(data)}
export async function editarIngrediente(id:number,request:{ingredienteDescripcion:string;unidadDeMedida:string|null}){const {data}=await api.put<OperacionIngrediente>(`/api/mantenimientos/ingredientes/${id}`,request);return validar(data)}
export async function cambiarEstadoIngrediente(id:number,estado:boolean){const {data}=await api.patch<OperacionIngrediente>(`/api/mantenimientos/ingredientes/${id}/estado`,{estado});return validar(data)}


export type CaracteristicaMantenimiento={
 caracteristicaId:number;caracteristicaDescripcion:string;caracteristicaUnidadDeMedida:string|null;
 tipoCaractId:number;tipoCaractDescripcion:string;metEnsayoId:number|null;metEnsayoDescripcion:string|null;
 estado:boolean;audUsuarioCreacion:string;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;tieneUso:boolean
};
export type TipoCaracteristicaMantenimiento={tipoCaractId:number;tipoCaractDescripcion:string};
export type MetodoEnsayoMantenimiento={metEnsayoId:number;metEnsayoDescripcion:string};
export type CatalogosCaracteristicaMantenimiento={tiposCaracteristica:TipoCaracteristicaMantenimiento[];metodosEnsayo:MetodoEnsayoMantenimiento[]};
export type OperacionCaracteristica={codigoResultado:number;mensaje:string;caracteristicaId?:number;estado?:boolean};
function validarCaracteristica(x:OperacionCaracteristica){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarCaracteristicas(params?:{busqueda?:string;tipoCaractId?:number;estado?:boolean}){const {data}=await api.get<CaracteristicaMantenimiento[]>("/api/mantenimientos/caracteristicas",{params});return data}
export async function obtenerCatalogosCaracteristica(){const {data}=await api.get<CatalogosCaracteristicaMantenimiento>("/api/mantenimientos/caracteristicas/catalogos");return data}
export async function crearCaracteristica(request:{caracteristicaDescripcion:string;caracteristicaUnidadDeMedida:string|null;tipoCaractId:number;metEnsayoId:number|null}){const {data}=await api.post<OperacionCaracteristica>("/api/mantenimientos/caracteristicas",request);return validarCaracteristica(data)}
export async function editarCaracteristica(id:number,request:{caracteristicaDescripcion:string;caracteristicaUnidadDeMedida:string|null;tipoCaractId:number;metEnsayoId:number|null}){const {data}=await api.put<OperacionCaracteristica>(`/api/mantenimientos/caracteristicas/${id}`,request);return validarCaracteristica(data)}
export async function cambiarEstadoCaracteristica(id:number,estado:boolean){const {data}=await api.patch<OperacionCaracteristica>(`/api/mantenimientos/caracteristicas/${id}/estado`,{estado});return validarCaracteristica(data)}
