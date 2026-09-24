import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";

import AppLogo from "@/components/branding/AppLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type TopbarProps = {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
};

function Topbar({ sidebarCollapsed, onSidebarToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/92 backdrop-blur">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir navegación">
                <Menu size={18} />
              </Button>
            }
          />
          <SheetContent side="left" className="w-[292px] border-0 bg-[var(--sidebar)] p-0 text-white">
            <SheetHeader className="sr-only">
              <SheetTitle>Navegación principal</SheetTitle>
            </SheetHeader>
            <div className="px-6 py-5">
              <AppLogo />
            </div>
            <div className="px-4 text-sm text-white/70">
              La navegación móvil completa se habilitará junto con el router del Sprint 2.
            </div>
          </SheetContent>
        </Sheet>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={onSidebarToggle}
          aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          <Menu size={18} />
        </Button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text)]">Centro de Operaciones</p>
          <p className="truncate text-xs text-[var(--text-secondary)]">Calidad · OVOSUR</p>
        </div>

        <div className="ml-auto hidden w-full max-w-md lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              aria-label="Buscar en OVOCALIDAD"
              placeholder="Buscar lotes, productos, documentos..."
              className="h-10 rounded-xl border-[var(--border)] bg-[var(--surface-muted)] pl-9 shadow-none"
            />
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--secondary)] ring-2 ring-white" />
        </Button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary)]">GM</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 md:block">
            <span className="block truncate text-sm font-semibold text-[var(--text)]">Giuliana Minaya</span>
            <span className="block truncate text-xs text-[var(--text-secondary)]">Supervisor SGC</span>
          </span>
          <ChevronDown size={15} className="hidden text-slate-400 md:block" />
        </button>
      </div>
    </header>
  );
}

export default Topbar;