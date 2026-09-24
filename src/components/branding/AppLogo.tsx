import logo from "@/assets/logos/ovosur-logo-web-transparente.svg";

type AppLogoProps = {
  collapsed?: boolean;
};

function AppLogo({ collapsed = false }: AppLogoProps) {
  return (
    <div className={collapsed ? "flex justify-center" : "space-y-3"}>
      <img
        src={logo}
        alt="OVOSUR"
        className={collapsed ? "h-10 w-10 object-contain" : "h-11 w-auto max-w-[170px] object-contain"}
      />
      {!collapsed ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-100/50">
            Suite de Calidad
          </p>
          <p className="mt-1 text-xs font-medium text-white/80">OVOCALIDAD 2.0</p>
        </div>
      ) : null}
    </div>
  );
}

export default AppLogo;