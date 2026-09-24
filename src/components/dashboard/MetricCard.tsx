import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  tone?: "primary" | "success" | "warning" | "info";
};

const toneClasses = {
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-blue-50 text-blue-700",
};

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  tone = "primary",
}: MetricCardProps) {
  return (
    <Card className="border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">{value}</p>
          </div>
          <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone]].join(" ")}>
            <Icon size={20} strokeWidth={1.9} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-secondary)]">{description}</p>
          {trend ? <span className="text-xs font-semibold text-[var(--primary)]">{trend}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;