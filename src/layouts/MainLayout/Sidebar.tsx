import {
    ClipboardCheck,
    FileText,
    FolderOpen,
    Home,
    Package,
    Settings,
    ShieldCheck,
    FlaskConical,
    ChartColumn,
} from "lucide-react";

import AppLogo from "@/components/branding/AppLogo";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";

function Sidebar() {

    return (

        <aside
            className="
                w-[260px]
                shrink-0
                bg-gradient-to-b
                from-[#0A5C77]
                to-[#084B61]
                text-white
                border-r
                border-sky-900/40
                shadow-2xl
                flex
                flex-col
            "
        >

            <div className="px-6 pt-6 pb-4">

                <AppLogo />

            </div>

            <nav
                className="
                    flex-1
                    overflow-y-auto
                    px-4
                    pb-6
                "
            >

                <SidebarGroup title="Inicio">

                    <SidebarItem
                        active
                        icon={Home}
                        text="Dashboard"
                    />

                </SidebarGroup>

                <SidebarGroup title="Gestión Documental">

                    <SidebarItem
                        icon={Package}
                        text="Productos"
                    />

                    <SidebarItem
                        icon={FileText}
                        text="Especificaciones Técnicas"
                    />

                    <SidebarItem
                        icon={FolderOpen}
                        text="Versiones"
                    />

                </SidebarGroup>

                <SidebarGroup title="Operación">

                    <SidebarItem
                        icon={FlaskConical}
                        text="Lotes"
                    />

                    <SidebarItem
                        icon={ClipboardCheck}
                        text="Evaluaciones"
                    />

                    <SidebarItem
                        icon={ChartColumn}
                        text="Resultados"
                    />

                </SidebarGroup>

                <SidebarGroup title="Certificación">

                    <SidebarItem
                        icon={ShieldCheck}
                        text="Certificados"
                    />

                    <SidebarItem
                        icon={ClipboardCheck}
                        text="Liberaciones"
                    />

                </SidebarGroup>

                <SidebarGroup title="Sistema">

                    <SidebarItem
                        icon={FolderOpen}
                        text="Trazabilidad"
                    />

                    <SidebarItem
                        icon={ChartColumn}
                        text="Reportes"
                    />

                    <SidebarItem
                        icon={Settings}
                        text="Administración"
                    />

                </SidebarGroup>

            </nav>

        </aside>

    );

}

export default Sidebar;