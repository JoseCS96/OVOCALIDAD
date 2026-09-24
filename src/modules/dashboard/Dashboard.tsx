import MetricCard from "@/components/dashboard/MetricCard";

import {
    ClipboardCheck,
    FileText,
    FlaskConical,
    ShieldCheck,
} from "lucide-react";

function Dashboard() {

    return (

        <div className="space-y-10">

            <div>

                <h1
                    className="
                        text-5xl
                        font-bold
                        text-slate-800
                    "
                >
                    Dashboard
                </h1>

                <p
                    className="
                        mt-3
                        text-lg
                        text-slate-500
                    "
                >
                    Centro de Operaciones de OVOCALIDAD 2.0
                </p>

            </div>

            <div
                className="
                    grid
                    gap-6
                    md:grid-cols-2
                    xl:grid-cols-4
                "
            >

                <MetricCard
                    title="ET Vigentes"
                    value={32}
                    description="Especificaciones activas"
                    icon={FileText}
                    color="#0F6EA8"
                />

                <MetricCard
                    title="Lotes Pendientes"
                    value={18}
                    description="Pendientes de evaluación"
                    icon={FlaskConical}
                    color="#F59E0B"
                />

                <MetricCard
                    title="Evaluaciones"
                    value={6}
                    description="En proceso"
                    icon={ClipboardCheck}
                    color="#10B981"
                />

                <MetricCard
                    title="Certificados"
                    value={186}
                    description="Emitidos"
                    icon={ShieldCheck}
                    color="#7C3AED"
                />

            </div>

        </div>

    );

}

export default Dashboard;