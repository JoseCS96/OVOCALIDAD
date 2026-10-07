import {api} from "@/lib/api";
import type {CrearFichaTecnicaRequest,CrearFichaTecnicaResponse,CaracteristicaFt,GuardarCaracteristicaFt,OperacionFt,FichaTecnicaGestion} from "./types";
function validar<T extends {codigoResultado:number;mensaje:string}>(data:T){if(data.codigoResultado!==0)throw new Error(data.mensaje);return data}
export async function crearFt(request:CrearFichaTecnicaRequest){const {data}=await api.post<CrearFichaTecnicaResponse>("/api/fichas-tecnicas",request);return validar(data)}
export async function listarCaracteristicasFt(versionId:number){const {data}=await api.get<CaracteristicaFt[]>(`/api/fichas-tecnicas/${versionId}/caracteristicas`);return data}
export async function guardarCaracteristicaFt(versionId:number,request:GuardarCaracteristicaFt){const {data}=await api.put<OperacionFt>(`/api/fichas-tecnicas/${versionId}/caracteristicas`,request);return validar(data)}
export async function eliminarCaracteristicaFt(versionId:number,id:number){const {data}=await api.delete<OperacionFt>(`/api/fichas-tecnicas/${versionId}/caracteristicas/${id}`);return validar(data)}

export async function listarFt(busqueda=""){const {data}=await api.get<FichaTecnicaGestion[]>("/api/fichas-tecnicas",{params:busqueda.trim()?{busqueda:busqueda.trim()}:undefined});return data}
export async function obtenerFt(versionId:number){const {data}=await api.get<FichaTecnicaGestion>(`/api/fichas-tecnicas/${versionId}`);return data}
