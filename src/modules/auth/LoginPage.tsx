import { useState, type FormEvent } from "react";
import axios from "axios";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AppLogo from "@/components/branding/AppLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthContext";

type LoginLocationState = { from?: string };

export default function LoginPage() {
  const { autenticado, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (autenticado) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEnviando(true);

    try {
      await login({ nombreUsuario: nombreUsuario.trim(), password });
      const from = (location.state as LoginLocationState | null)?.from;
      navigate(from && from !== "/login" ? from : "/", { replace: true });
    } catch (loginError) {
      if (axios.isAxiosError(loginError) && loginError.response?.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("No fue posible iniciar sesión. Verifica que la API esté disponible.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,var(--sidebar-strong)_0%,var(--sidebar)_58%,#126f82_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full border border-white/10" />
        <AppLogo />
        <div className="relative max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-wide text-sky-50">
            <ShieldCheck size={15} /> Gestión de Calidad
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.035em]">Control, evaluación y trazabilidad en un solo entorno.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-sky-50/70">Acceso seguro a los procesos de calidad de OVOSUR según el perfil y los permisos asignados.</p>
        </div>
        <p className="relative text-xs text-sky-100/45">OVOCALIDAD 2.0 · OVOSUR</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-9 lg:hidden"><AppLogo /></div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Acceso al sistema</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">Bienvenido a OVOCALIDAD</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Ingresa tus credenciales para continuar.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text)]">Usuario</span>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <Input value={nombreUsuario} onChange={(event) => setNombreUsuario(event.target.value)} autoComplete="username" autoFocus required className="h-12 rounded-xl pl-10" placeholder="usuario" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text)]">Contraseña</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="h-12 rounded-xl pl-10" placeholder="••••••••" />
              </div>
            </label>

            {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <Button type="submit" disabled={enviando || !nombreUsuario.trim() || !password} className="h-12 w-full rounded-xl text-sm font-semibold">
              {enviando ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="mt-8 border-t border-[var(--border)] pt-5 text-xs leading-5 text-[var(--text-secondary)]">El acceso y las acciones disponibles se determinan según tu perfil de seguridad.</div>
        </div>
      </section>
    </main>
  );
}
