import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { iniciarSesion, obtenerMiAcceso } from "./api";
import { clearSession, hasActiveSession, saveSession } from "./session";
import type { AccesosUsuario, LoginRequest } from "./types";

type AuthContextValue = {
  acceso: AccesosUsuario | null;
  cargando: boolean;
  autenticado: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
  tienePermiso: (permiso: string) => boolean;
  tieneModulo: (moduloCodigo: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [acceso, setAcceso] = useState<AccesosUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarAcceso = useCallback(async () => {
    if (!hasActiveSession()) {
      setAcceso(null);
      setCargando(false);
      return;
    }

    try {
      const data = await obtenerMiAcceso();
      setAcceso(data);
    } catch {
      clearSession();
      setAcceso(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarAcceso();

    const handleUnauthorized = () => {
      setAcceso(null);
      setCargando(false);
    };

    window.addEventListener("ovocalidad:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("ovocalidad:unauthorized", handleUnauthorized);
  }, [cargarAcceso]);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await iniciarSesion(request);
    saveSession(response.token, response.expiraEn);

    try {
      const data = await obtenerMiAcceso();
      setAcceso(data);
    } catch (error) {
      clearSession();
      setAcceso(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAcceso(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    acceso,
    cargando,
    autenticado: acceso !== null,
    login,
    logout,
    tienePermiso: (permiso) => acceso?.permisos.includes(permiso) ?? false,
    tieneModulo: (moduloCodigo) => acceso?.modulos.some((modulo) => modulo.moduloCodigo === moduloCodigo) ?? false,
  }), [acceso, cargando, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}
