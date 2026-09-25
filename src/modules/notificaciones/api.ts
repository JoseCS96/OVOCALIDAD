import api from "@/lib/api";
import type {Notificacion,OperacionNotificacion} from "./types";

export async function obtenerNotificaciones(){
 const {data}=await api.get<Notificacion[]>("/api/seguridad/notificaciones");
 return data;
}
export async function marcarNotificacionLeida(notificacionId:number){
 const {data}=await api.put<OperacionNotificacion>(`/api/seguridad/notificaciones/${notificacionId}/leida`);
 return data;
}
export async function marcarModalMostrado(){
 const {data}=await api.put<OperacionNotificacion>("/api/seguridad/notificaciones/modal-mostradas");
 return data;
}
