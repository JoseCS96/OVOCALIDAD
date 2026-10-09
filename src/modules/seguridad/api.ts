import { api } from "@/lib/api";

export type UsuarioAccesoMantenimiento={
  segUsuarioId:number;
  nombreUsuario:string;
  nombresApellidos:string;
  correo:string|null;
  estado:boolean;
  ultimoAcceso:string|null;
  perfilCodigo:string|null;
  perfilDescripcion:string|null;
  usuarioDniResponsable:string|null;
  responsableNombre:string|null;
};

export type PerfilAccesoMantenimiento={
  perfilId:number;
  perfilCodigo:string;
  perfilDescripcion:string;
};

export type CrearUsuarioAccesoResponse={
  codigoResultado:number;
  mensaje:string;
  segUsuarioId:number|null;
  nombreUsuario:string|null;
  perfilId:number|null;
};

export async function listarUsuariosAcceso(params?:{busqueda?:string;estado?:boolean}){
  const {data}=await api.get<UsuarioAccesoMantenimiento[]>("/api/seguridad/usuarios",{params});
  return data;
}

export async function listarPerfilesAcceso(){
  const {data}=await api.get<PerfilAccesoMantenimiento[]>("/api/seguridad/perfiles");
  return data;
}

export async function crearUsuarioAcceso(request:{
  nombreUsuario:string;
  nombresApellidos:string;
  correo:string|null;
  password:string;
  perfilId:number;
}){
  const {data}=await api.post<CrearUsuarioAccesoResponse>("/api/seguridad/usuarios",request);
  if(data.codigoResultado!==0)throw new Error(data.mensaje);
  return data;
}

export async function cambiarEstadoUsuarioAcceso(segUsuarioId:number,estado:boolean){
  const {data}=await api.patch<{codigoResultado:number;mensaje:string;segUsuarioId:number;estado:boolean}>(
    `/api/seguridad/usuarios/${segUsuarioId}/estado`,
    {estado}
  );
  if(data.codigoResultado!==0)throw new Error(data.mensaje);
  return data;
}
