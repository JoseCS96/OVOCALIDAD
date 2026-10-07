import {api} from "@/lib/api";
import type {AgregarSeccionFt,CaracteristicaFt,GuardarCaracteristicaFt,GuardarSeccionFt,OperacionFt,ReordenarSeccionesFt,SeccionFt} from "./types";

function validar<T extends OperacionFt>(data:T){if(data.codigoResultado!==0)throw new Error(data.mensaje||"La operación no pudo completarse.");return data}

export async function listarSeccionesFt(versionId:number){const {data}=await api.get<SeccionFt[]>(`/api/fichas-tecnicas/${versionId}/secciones`);return data}
export async function guardarSeccionFt(versionId:number,seccionId:number,request:GuardarSeccionFt){const {data}=await api.put<OperacionFt>(`/api/fichas-tecnicas/${versionId}/secciones/${seccionId}`,request);return validar(data)}
export async function agregarSeccionFt(versionId:number,request:AgregarSeccionFt){const {data}=await api.post<OperacionFt>(`/api/fichas-tecnicas/${versionId}/secciones`,request);return validar(data)}
export async function quitarSeccionFt(versionId:number,seccionId:number){const {data}=await api.delete<OperacionFt>(`/api/fichas-tecnicas/${versionId}/secciones/${seccionId}`,{data:{usuario:"USUARIO_WEB"}});return validar(data)}
export async function reordenarSeccionesFt(versionId:number,request:ReordenarSeccionesFt){const {data}=await api.put<OperacionFt>(`/api/fichas-tecnicas/${versionId}/secciones/orden`,request);return validar(data)}
export async function listarCaracteristicasFt(versionId:number){const {data}=await api.get<CaracteristicaFt[]>(`/api/fichas-tecnicas/${versionId}/caracteristicas`);return data}
export async function guardarCaracteristicaFt(versionId:number,id:number,request:GuardarCaracteristicaFt){const {data}=await api.put<OperacionFt>(`/api/fichas-tecnicas/${versionId}/caracteristicas/${id}`,request);return validar(data)}
