import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FlaskConical,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import MetricCard from "@/components/dashboard/MetricCard";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activity = [
  { lot: "C19541L3", product: "CL06-B", status: "Liberado", time: "Hace 18 min" },
  { lot: "H161738L3", product: "HL01", status: "En evaluación", time: "Hace 42 min" },
  { lot: "Y19539L2", product: "YL11", status: "Liberado", time: "Hace 1 h" },
  { lot: "C461716D2", product: "CFD08", status: "Observado", time: "Hace 2 h" },
];

const pending = [
  { title: "Evaluaciones pendientes", value: "18", hint: "Requieren revisión de Calidad", icon: ClipboardCheck },
  { title: "Resultados por registrar", value: "6", hint: "Análisis con datos pendientes", icon: FlaskConical },
  { title: "Certificados por aprobar", value: "4", hint: "Listos para validación final", icon: ShieldCheck },
];

function Dashboard() {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        eyebrow="OVOCALIDAD 2.0"
        title="Dashboard ejecutivo"
        description="Visión operativa consolidada de documentos, lotes, evaluaciones y certificación de calidad."
        actions={
          <>
            <Button variant="outline">Ver reportes</Button>
            <Button className="bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]">
              Nueva evaluación
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="ET vigentes"
          value={32}
          description="Especificaciones activas"
          icon={FileText}
          trend="+2 este mes"
        />
        <MetricCard
          title="Lotes pendientes"
          value={18}
          description="Pendientes de evaluación"
          icon={FlaskConical}
          tone="warning"
          trend="6 prioritarios"
        />
        <MetricCard
          title="Evaluaciones"
          value={6}
          description="En proceso actualmente"
          icon={ClipboardCheck}
          tone="success"
          trend="83% al día"
        />
        <MetricCard
          title="Certificados"
          value={186}
          description="Emitidos en el periodo"
          icon={ShieldCheck}
          tone="info"
          trend="+12.4%"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border)]">
            <div>
              <CardTitle className="text-base">Actividad reciente de lotes</CardTitle>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Últimos movimientos registrados en el flujo de calidad</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-[var(--primary)]">
              Ver todos <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-[var(--surface-muted)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Lote</th>
                    <th className="px-5 py-3 font-semibold">Producto</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                    <th className="px-5 py-3 font-semibold">Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((item) => (
                    <tr key={item.lot} className="border-t border-[var(--border)] text-sm">
                      <td className="px-5 py-4 font-semibold text-[var(--text)]">{item.lot}</td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{item.product}</td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={
                            item.status === "Liberado"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : item.status === "Observado"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-base">Carga operativa</CardTitle>
              <p className="text-xs text-[var(--text-secondary)]">Pendientes que requieren atención</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map(({ title, value, hint, icon: Icon }) => (
                <div key={title} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--primary)] shadow-sm">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{hint}</p>
                  </div>
                  <span className="text-lg font-semibold text-[var(--text)]">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-base">Estado del proceso</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="mx-auto text-emerald-600" size={20} />
                <p className="mt-2 text-xl font-semibold text-emerald-700">92%</p>
                <p className="text-[11px] text-emerald-700/70">Cumplimiento</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <TimerReset className="mx-auto text-amber-600" size={20} />
                <p className="mt-2 text-xl font-semibold text-amber-700">45 min</p>
                <p className="text-[11px] text-amber-700/70">Ciclo objetivo</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-3">
                <AlertTriangle className="mx-auto text-rose-600" size={20} />
                <p className="mt-2 text-xl font-semibold text-rose-700">3</p>
                <p className="text-[11px] text-rose-700/70">Observados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}

export default Dashboard;