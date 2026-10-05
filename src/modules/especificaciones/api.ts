import { api } from "@/lib/api";
import type { ProductoGenesis } from "../lotes/types";
import type { CatalogosEt, DetalleEt, GuardarCaracteristicaEt, OperacionEt, EspecificacionTecnicaListado, CrearEspecificacionTecnica, CrearEspecificacionTecnicaResponse, SeccionesEtCatalogo, CrearSeccionEt, CrearSeccionEtResponse, ContenidoSeccionEt, AgregarSeccionVersionEt, ReordenarSeccionesVersionEt, GuardarInformacionGeneralEt, GuardarContenidoBaseEt, ResponsableCatalogoEt, GuardarResponsablesEt, CatalogosIngredientesEt, GuardarIngredientesEt, GuardarRecetasEt, GuardarProcedimientosEt, CatalogosTratamientosEt, GuardarTratamientosEt, GuardarInstruccionesEt, GuardarContenidoRotuladoEt, ContenidoRotuladoCatalogo, GuardarCambiosEt, GuardarAnexosEt, CambiarEstadoEt, CambiarEstadoEtResponse, VersionReemplazableEt } from "./types";
function validar(data:OperacionEt){if(data.codigoResultado!==0)throw new Error(data.mensaje);return data}
export async function obtenerEt(versionId:number){
 const {data}=await api.get<DetalleEt>(`/api/especificaciones-tecnicas/${versionId}`);
 if(data.informacionGeneral.archivoOriginalNombre){
  const base=(import.meta.env.VITE_API_URL??"").replace(/\/$/,"");
  data.informacionGeneral.archivoOriginalUrl=`${base}/api/especificaciones-tecnicas/${versionId}/pdf`;
 }
 return data
}
export async function buscarPresentacionesGenesisEt(busqueda:string){const {data}=await api.get<ProductoGenesis[]>("/api/lotes/productos-genesis",{params:{busqueda}});return data}
export async function obtenerCatalogosEt(){const {data}=await api.get<CatalogosEt>("/api/especificaciones-tecnicas/catalogos");return data}
export async function guardarCaracteristica(versionId:number,request:GuardarCaracteristicaEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/caracteristicas`,request);return validar(data)}
export async function eliminarCaracteristica(versionId:number,versCaractId:number){const {data}=await api.delete<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/caracteristicas/${versCaractId}`,{data:{}});return validar(data)}

export async function listarEt(params?:{busqueda?:string;productoCodigo?:string;estVerId?:number}){const {data}=await api.get<EspecificacionTecnicaListado[]>("/api/especificaciones-tecnicas",{params});return data}

export async function crearEt(request:CrearEspecificacionTecnica){const {data}=await api.post<CrearEspecificacionTecnicaResponse>("/api/especificaciones-tecnicas",request);return validar(data) as CrearEspecificacionTecnicaResponse}

export async function obtenerSeccionesEt(){const {data}=await api.get<SeccionesEtCatalogo>("/api/especificaciones-tecnicas/secciones");return data}
export async function crearSeccionEt(request:CrearSeccionEt){const {data}=await api.post<CrearSeccionEtResponse>("/api/especificaciones-tecnicas/secciones",request);return validar(data) as CrearSeccionEtResponse}

export async function obtenerContenidoSeccionesEt(versionId:number){const {data}=await api.get<ContenidoSeccionEt[]>(`/api/especificaciones-tecnicas/${versionId}/secciones/contenido`);return data}
export async function agregarSeccionVersionEt(versionId:number,request:AgregarSeccionVersionEt){const {data}=await api.post<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones`,request);return validar(data)}
export async function quitarSeccionVersionEt(versionId:number,versSeccId:number){const {data}=await api.delete<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones/${versSeccId}`,{data:{}});return validar(data)}
export async function reordenarSeccionesVersionEt(versionId:number,request:ReordenarSeccionesVersionEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones/orden`,request);return validar(data)}
export async function guardarContenidoSeccionEt(versionId:number,versSeccId:number,contenido:string){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/secciones/${versSeccId}/contenido`,{contenido});return validar(data)}

export async function obtenerVersionesReemplazablesEt(versionId:number){const {data}=await api.get<VersionReemplazableEt[]>(`/api/especificaciones-tecnicas/${versionId}/versiones-reemplazables`);return data}
export async function guardarInformacionGeneralEt(versionId:number,request:GuardarInformacionGeneralEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/informacion-general`,request);return validar(data)}
export async function guardarContenidoBaseEt(versionId:number,request:GuardarContenidoBaseEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/contenido-base`,request);return validar(data)}

export async function obtenerResponsablesEt(){const {data}=await api.get<ResponsableCatalogoEt[]>("/api/especificaciones-tecnicas/responsables");return data}
export async function guardarResponsablesEt(versionId:number,request:GuardarResponsablesEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/responsables`,request);return validar(data)}

export async function obtenerCatalogosIngredientesEt(){const {data}=await api.get<CatalogosIngredientesEt>("/api/especificaciones-tecnicas/ingredientes/catalogos");return data}
export async function guardarIngredientesEt(versionId:number,request:GuardarIngredientesEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/ingredientes`,request);return validar(data)}

export async function guardarRecetasEt(versionId:number,request:GuardarRecetasEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/recetas`,request);return validar(data)}

export async function guardarProcedimientosEt(versionId:number,request:GuardarProcedimientosEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/procedimientos`,request);return validar(data)}

export async function obtenerCatalogosTratamientosEt(){const {data}=await api.get<CatalogosTratamientosEt>("/api/especificaciones-tecnicas/tratamientos/catalogos");return data}
export async function guardarTratamientosEt(versionId:number,request:GuardarTratamientosEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/tratamientos`,request);return validar(data)}

export async function guardarInstruccionesEt(versionId:number,request:GuardarInstruccionesEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/instrucciones`,request);return validar(data)}

export async function obtenerCatalogoContenidoRotuladoEt(){const {data}=await api.get<ContenidoRotuladoCatalogo[]>("/api/especificaciones-tecnicas/contenido-rotulado/catalogo");return data}
export async function guardarContenidoRotuladoEt(versionId:number,request:GuardarContenidoRotuladoEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/contenido-rotulado`,request);return validar(data)}

export async function guardarAnexosEt(versionId:number,request:GuardarAnexosEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/anexos`,request);return validar(data)}

export async function guardarCambiosEt(versionId:number,request:GuardarCambiosEt){const {data}=await api.put<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/cambios`,request);return validar(data)}

export async function cambiarEstadoEt(versionId:number,request:CambiarEstadoEt){const {data}=await api.post<CambiarEstadoEtResponse>(`/api/especificaciones-tecnicas/${versionId}/cambiar-estado`,request);return validar(data) as CambiarEstadoEtResponse}

export async function resetearEt(versionId:number){const {data}=await api.post<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/resetear`);return validar(data)}
export async function eliminarEtBorrador(versionId:number){const {data}=await api.delete<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}`);return validar(data)}


export async function retornarEtBorrador(versionId:number,password:string,comentario:string|null){
 const {data}=await api.post<CambiarEstadoEtResponse>(`/api/especificaciones-tecnicas/${versionId}/retornar-borrador`,{password,comentario});
 if(data.codigoResultado!==0)throw new Error(data.mensaje);
 return data;
}


export async function vincularPdfEt(versionId:number,archivo:File){
 const form=new FormData();
 form.append("archivo",archivo);
 const {data}=await api.post<OperacionEt>(`/api/especificaciones-tecnicas/${versionId}/pdf`,form);
 return validar(data);
}


export async function obtenerPdfEt(versionId:number){
 const {data}=await api.get<Blob>(`/api/especificaciones-tecnicas/${versionId}/pdf`,{responseType:"blob"});
 return data;
}
