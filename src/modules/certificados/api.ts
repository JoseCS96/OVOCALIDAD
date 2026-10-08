import {api} from "@/lib/api";
import type {CertificadoEmpresa,FichaTecnicaCertificado,GuardarCertificadoEmpresa,OperacionEmpresaCertificado,OperacionPlantilla,ParametroFt,PlantillaDetalle,PlantillaLista,SeccionDiseno} from "./types";
const validar=<T extends {codigoResultado:number;mensaje:string}>(x:T)=>{if(x.codigoResultado!==0)throw new Error(x.mensaje);return x};
export async function listarPlantillas(versionFtId?:number,productoCodigo?:string){const {data}=await api.get<PlantillaLista[]>("/api/certificados/plantillas",{params:{versionFtId,productoCodigo}});return data}
export async function obtenerPlantilla(id:number){const {data}=await api.get<PlantillaDetalle>(`/api/certificados/plantillas/${id}`);return data}
export async function crearPlantilla(body:{versionFtId:number;nombre:string;descripcion:string|null}){const {data}=await api.post<OperacionPlantilla>("/api/certificados/plantillas",body);return validar(data)}
export async function guardarDiseno(id:number,secciones:SeccionDiseno[]){const {data}=await api.put<OperacionPlantilla>(`/api/certificados/plantillas/${id}/diseno`,{secciones});return validar(data)}
export async function eliminarPlantilla(id:number){const {data}=await api.delete<OperacionPlantilla>(`/api/certificados/plantillas/${id}`);return validar(data)}
export async function parametrosFt(versionId:number){const {data}=await api.get<ParametroFt[]>(`/api/fichas-tecnicas/${versionId}/configuracion-certificado`);return data}
export async function listarFichasTecnicasCertificado(busqueda=""){const {data}=await api.get<FichaTecnicaCertificado[]>("/api/fichas-tecnicas/para-certificado",{params:busqueda.trim()?{busqueda:busqueda.trim()}:undefined});return data}

export async function obtenerEmpresaCertificado(){const {data}=await api.get<CertificadoEmpresa>("/api/certificados/empresa");return data}
export async function guardarEmpresaCertificado(body:GuardarCertificadoEmpresa){const {data}=await api.put<OperacionEmpresaCertificado>("/api/certificados/empresa",body);return validar(data)}
