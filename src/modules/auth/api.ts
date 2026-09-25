import { api } from "@/lib/api";
import type { AccesosUsuario, LoginRequest, LoginResponse } from "./types";

export async function iniciarSesion(request: LoginRequest) {
  const { data } = await api.post<LoginResponse>("/api/auth/login", request);
  return data;
}

export async function obtenerMiAcceso() {
  const { data } = await api.get<AccesosUsuario>("/api/seguridad/mi-acceso");
  return data;
}
