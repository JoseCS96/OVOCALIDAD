import axios from "axios";
import type { CatalogosEt, DetalleEt, GuardarCaracteristicaEt, OperacionEt } from "./types";
const api=axios.create({baseURL:import.meta.env.VITE_API_URL??""});
function validar(data:OperacionEt){if(data.codigoResultado!==0)throw new Error(data.mensaje);return data}
export async function obtenerEt(versionId:number){const {data}=await api.get<DetalleEt>(`/api/especificaciones-tecnicas/${versionId}`);return data}
export async function obtenerCatalogosEt(){const {data}=await api.get<CatalogosEt>("/api/especificaciones-tecnicas/catalogos");return data}
export async function guardarCaracteristica(versionId:number,request:GuardarCaracteristicaEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/caracteristicas`,request);return validar(data)}
export async function eliminarCaracteristica(versionId:number,versCaractId:number){const {data}=await api.delete<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/caracteristicas/${versCaractId}`,{data:{usuario:"USUARIO_WEB"}});return validar(data)}
