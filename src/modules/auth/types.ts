export type UsuarioSesion = {
  segUsuarioId: number;
  nombreUsuario: string;
  nombresApellidos: string;
  correo: string | null;
  ultimoAcceso: string | null;
};

export type PerfilAcceso = {
  perfilId: number;
  perfilCodigo: string;
  perfilDescripcion: string;
  areaId: number;
  areaCodigo: string;
  areaDescripcion: string;
};

export type ModuloAcceso = {
  moduloId: number;
  moduloCodigo: string;
  moduloDescripcion: string;
  ruta: string;
  icono: string | null;
  orden: number;
};

export type AccesosUsuario = {
  usuario: UsuarioSesion;
  perfiles: PerfilAcceso[];
  modulos: ModuloAcceso[];
  permisos: string[];
};

export type LoginRequest = {
  nombreUsuario: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  expiraEn: string;
  usuario: UsuarioSesion;
};
