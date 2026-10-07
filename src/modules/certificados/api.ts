import {api} from "@/lib/api";
import type {OperacionPlantilla,ParametroFt,PlantillaDetalle,PlantillaLista,SeccionDiseno} from "./types";
const validar=<T extends {codigoResultado:number;mensaje:string}>(x:T)=>{if(x.codigoResultado!==0)throw new Error(x.mensaje);return x};
export async function listarPlantillas(){const {data}=await api.get<PlantillaLista[]>("/api/certificados/plantillas");return data}
export async function obtenerPlantilla(id:number){const {data}=await api.get<PlantillaDetalle>(`/api/certificados/plantillas/${id}`);return data}
export async function crearPlantilla(body:{versionFtId:number;nombre:string;descripcion:string|null}){const {data}=await api.post<OperacionPlantilla>("/api/certificados/plantillas",body);return validar(data)}
export async function guardarDiseno(id:number,secciones:SeccionDiseno[]){const {data}=await api.put<OperacionPlantilla>(`/api/certificados/plantillas/${id}/diseno`,{secciones});return validar(data)}
export async function eliminarPlantilla(id:number){const {data}=await api.delete<OperacionPlantilla>(`/api/certificados/plantillas/${id}`);return validar(data)}
export async function parametrosFt(versionId:number){const {data}=await api.get<ParametroFt[]>(`/api/fichas-tecnicas/${versionId}/configuracion-certificado`);return data}
