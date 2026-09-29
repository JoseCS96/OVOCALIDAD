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
