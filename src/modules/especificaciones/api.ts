import axios from "axios";
import type { CatalogosEt, DetalleEt, GuardarCaracteristicaEt, OperacionEt, EspecificacionTecnicaListado, CrearEspecificacionTecnica, CrearEspecificacionTecnicaResponse, SeccionesEtCatalogo, CrearSeccionEt, CrearSeccionEtResponse, ContenidoSeccionEt, AgregarSeccionVersionEt, ReordenarSeccionesVersionEt, GuardarInformacionGeneralEt } from "./types";
const api=axios.create({baseURL:import.meta.env.VITE_API_URL??""});
function validar(data:OperacionEt){if(data.codigoResultado!==0)throw new Error(data.mensaje);return data}
export async function obtenerEt(versionId:number){const {data}=await api.get<DetalleEt>(`/api/especificaciones-tecnicas/${versionId}`);return data}
export async function obtenerCatalogosEt(){const {data}=await api.get<CatalogosEt>("/api/especificaciones-tecnicas/catalogos");return data}
export async function guardarCaracteristica(versionId:number,request:GuardarCaracteristicaEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/caracteristicas`,request);return validar(data)}
export async function eliminarCaracteristica(versionId:number,versCaractId:number){const {data}=await api.delete<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/caracteristicas/${versCaractId}`,{data:{usuario:"USUARIO_WEB"}});return validar(data)}

export async function listarEt(params?:{busqueda?:string;productoCodigo?:string;estVerId?:number}){const {data}=await api.get<EspecificacionTecnicaListado[]>("/api/especificaciones-tecnicas",{params});return data}

export async function crearEt(request:CrearEspecificacionTecnica){const {data}=await api.post<CrearEspecificacionTecnicaResponse>("/api/especificaciones-tecnicas",request);return validar(data) as CrearEspecificacionTecnicaResponse}

export async function obtenerSeccionesEt(){const {data}=await api.get<SeccionesEtCatalogo>("/api/especificaciones-tecnicas/secciones");return data}
export async function crearSeccionEt(request:CrearSeccionEt){const {data}=await api.post<CrearSeccionEtResponse>("/api/especificaciones-tecnicas/secciones",request);return validar(data) as CrearSeccionEtResponse}

export async function obtenerContenidoSeccionesEt(versionId:number){const {data}=await api.get<ContenidoSeccionEt[]>(`/api/especificaciones-tecnicas/${versionId}/secciones/contenido`);return data}
export async function agregarSeccionVersionEt(versionId:number,request:AgregarSeccionVersionEt){const {data}=await api.post<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones`,request);return validar(data)}
export async function quitarSeccionVersionEt(versionId:number,versSeccId:number){const {data}=await api.delete<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones/${versSeccId}`,{data:{usuario:"USUARIO_WEB"}});return validar(data)}
export async function reordenarSeccionesVersionEt(versionId:number,request:ReordenarSeccionesVersionEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones/orden`,request);return validar(data)}
export async function guardarContenidoSeccionEt(versionId:number,versSeccId:number,contenido:string){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones/${versSeccId}/contenido`,{contenido,usuario:"USUARIO_WEB"});return validar(data)}

export async function guardarInformacionGeneralEt(versionId:number,request:GuardarInformacionGeneralEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/informacion-general`,request);return validar(data)}
