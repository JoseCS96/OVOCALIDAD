import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

type Props = { title: string; description: string; eyebrow: string; icon: LucideIcon };

export default function ModulePlaceholder({ title, description, eyebrow, icon: Icon }: Props) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
        <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon size={26} /></div>
          <h2 className="mt-5 text-lg font-semibold">Módulo preparado</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">La ruta, navegación y shell ya están desacoplados. La funcionalidad de negocio se incorporará sin modificar la arquitectura principal.</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[var(--primary)]"><Construction size={15} /> OVOCALIDAD 2.0</div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}