import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loading from "@/components/feedback/Loading";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { autenticado, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Loading />
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
