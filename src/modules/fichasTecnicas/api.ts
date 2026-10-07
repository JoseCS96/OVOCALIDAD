import {api} from "@/lib/api";
import type {CrearFichaTecnicaRequest,CrearFichaTecnicaResponse,CaracteristicaFt,GuardarCaracteristicaFt,OperacionFt,FichaTecnicaGestion,EliminarFichaTecnicaResponse,SeccionFt,OperacionSeccionFt,ReordenarSeccionesFt} from "./types";
function validar<T extends {codigoResultado:number;mensaje:string}>(data:T){if(data.codigoResultado!==0)throw new Error(data.mensaje);return data}
export async function crearFt(request:CrearFichaTecnicaRequest){const {data}=await api.post<CrearFichaTecnicaResponse>("/api/fichas-tecnicas",request);return validar(data)}
export async function listarCaracteristicasFt(versionId:number){const {data}=await api.get<CaracteristicaFt[]>(`/api/fichas-tecnicas/${versionId}/caracteristicas`);return data}
export async function guardarCaracteristicaFt(versionId:number,request:GuardarCaracteristicaFt){const {data}=await api.put<OperacionFt>(`/api/fichas-tecnicas/${versionId}/caracteristicas`,request);return validar(data)}
export async function eliminarCaracteristicaFt(versionId:number,id:number){const {data}=await api.delete<OperacionFt>(`/api/fichas-tecnicas/${versionId}/caracteristicas/${id}`);return validar(data)}

export async function listarFt(busqueda=""){const {data}=await api.get<FichaTecnicaGestion[]>("/api/fichas-tecnicas",{params:busqueda.trim()?{busqueda:busqueda.trim()}:undefined});return data}
export async function obtenerFt(versionId:number){const {data}=await api.get<FichaTecnicaGestion>(`/api/fichas-tecnicas/${versionId}`);return data}

export async function eliminarFtBorrador(versionId:number){const {data}=await api.delete<EliminarFichaTecnicaResponse>(`/api/fichas-tecnicas/${versionId}`);return validar(data)}

export async function listarSeccionesFt(versionId:number){const {data}=await api.get<SeccionFt[]>(`/api/fichas-tecnicas/${versionId}/secciones`);return data}
export async function guardarContenidoSeccionFt(versionId:number,versSeccId:number,contenido:string|null){const {data}=await api.put<OperacionSeccionFt>(`/api/fichas-tecnicas/${versionId}/secciones/${versSeccId}/contenido`,{contenido});return validar(data)}
export async function agregarSeccionFt(versionId:number,seccionId:number,orden:number|null=null){const {data}=await api.post<OperacionSeccionFt>(`/api/fichas-tecnicas/${versionId}/secciones`,{seccionId,orden});return validar(data)}
export async function quitarSeccionFt(versionId:number,versSeccId:number){const {data}=await api.delete<OperacionSeccionFt>(`/api/fichas-tecnicas/${versionId}/secciones/${versSeccId}`);return validar(data)}
export async function reordenarSeccionesFt(versionId:number,request:ReordenarSeccionesFt){const {data}=await api.put<OperacionSeccionFt>(`/api/fichas-tecnicas/${versionId}/secciones/orden`,request);return validar(data)}
