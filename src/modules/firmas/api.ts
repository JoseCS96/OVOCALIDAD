import {api} from "@/lib/api";

export type FirmaDocumentoSolicitud={
 documentoFirmaSolicitudId:number;
 tipoDocumento:string;
 entidadId:number;
 documentoCodigo:string;
 documentoDescripcion:string;
 versionNumero:number|null;
 tipoResponsabilidad:string;
 usuarioDni:string;
 responsableNombre:string;
 cargoDescripcion:string|null;
 estadoSolicitud:"PENDIENTE"|"FIRMADO"|"SIN_USUARIO"|"ANULADO";
 fechaSolicitud:string;
 fechaFirma:string|null;
 urlDocumento:string|null;
};

export type OperacionFirmaDocumento={
 codigoResultado:number;
 mensaje:string;
 documentoFirmaSolicitudId:number|null;
 estadoSolicitud:string|null;
 fechaFirma:string|null;
};

export type FirmaDocumentoAplicada={
 documentoFirmaSolicitudId:number;
 tipoDocumento:string;
 entidadId:number;
 usuarioDni:string;
 tipoResponsabilidad:string;
 responsableNombre:string;
 cargoDescripcion:string|null;
 firmaMimeType:string|null;
 firmaImagen:string|null;
 fechaFirma:string;
};

export async function listarMisSolicitudesFirma(estado?:string){
 const {data}=await api.get<FirmaDocumentoSolicitud[]>("/api/firmas/solicitudes",{params:{estado}});
 return data;
}

export async function obtenerMiSolicitudFirma(tipoDocumento:string,entidadId:number){
 try{
  const {data}=await api.get<FirmaDocumentoSolicitud>("/api/firmas/solicitudes/mia",{params:{tipoDocumento,entidadId}});
  return data;
 }catch{
  return null;
 }
}

export async function firmarDocumento(solicitudId:number,password:string){
 const {data}=await api.post<OperacionFirmaDocumento>(`/api/firmas/solicitudes/${solicitudId}/firmar`,{password});
 return data;
}

export async function obtenerFirmaAplicadaDocumento(tipoDocumento:string,entidadId:number,usuarioDni:string){
 try{
  const {data}=await api.get<FirmaDocumentoAplicada>(
   `/api/firmas/documentos/${encodeURIComponent(tipoDocumento)}/${entidadId}/responsables/${encodeURIComponent(usuarioDni)}`
  );
  return data;
 }catch{
  return null;
 }
}
