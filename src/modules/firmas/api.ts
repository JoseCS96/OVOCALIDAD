import {api} from "@/lib/api";

export type FirmaResponsableDocumento={
 codigoResultado:number;
 mensaje:string;
 usuarioDni:string;
 firmaMimeType:string|null;
 firmaNombreArchivo:string|null;
 firmaImagen:string|null;
 fechaActualizacion:string|null;
};

export async function obtenerFirmaResponsableDocumento(usuarioDni:string){
 try{
  const {data}=await api.get<FirmaResponsableDocumento>(`/api/firmas/responsables/${encodeURIComponent(usuarioDni)}`);
  return data;
 }catch{
  return null;
 }
}
