import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

type ProtectedRouteProps = {
  perfilesPermitidos?: string[];
};

export default function ProtectedRoute({ perfilesPermitidos }: ProtectedRouteProps) {
  const { autenticado, cargando, tienePerfil } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--primary)]" />
          Validando sesión...
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (perfilesPermitidos && !perfilesPermitidos.some(tienePerfil)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
