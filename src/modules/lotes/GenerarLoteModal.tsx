import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generarLote, obtenerCatalogosLote } from "./api";
import type { GenerarLoteRequest } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<unknown> | unknown;
};

const emptyForm: GenerarLoteRequest = {
  productoCodigo: "",
  naturalezaId: 0,
  faseId: 0,
  lineaOrigenId: 0,
  observacion: "",
  usuario: "USUARIO_WEB",
};

export default function GenerarLoteModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<GenerarLoteRequest>(emptyForm);
  const [resultado, setResultado] = useState<{ codigo?: string; mensaje: string } | null>(null);

  const catalogos = useQuery({
    queryKey: ["lotes-catalogos"],
    queryFn: obtenerCatalogosLote,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: generarLote,
    onSuccess: async (response) => {
      if (response.resultado.codigoResultado !== 0) {
        setResultado({ mensaje: response.resultado.mensaje || "No se pudo generar el lote." });
        return;
      }
      setResultado({
        codigo: response.lote?.codigoLote,
        mensaje: response.resultado.mensaje || "Lote generado correctamente.",
      });
      await onCreated();
    },
    onError: () => setResultado({ mensaje: "No se pudo comunicar con la API para generar el lote." }),
  });

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setResultado(null);
      mutation.reset();
    }
  }, [open]);

  if (!open) return null;

  const valido = form.productoCodigo && form.naturalezaId > 0 && form.faseId > 0 && form.lineaOrigenId > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResultado(null);
    if (!valido) return;
    mutation.mutate({
      ...form,
      observacion: form.observacion?.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && !mutation.isPending && onClose()}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]"><Plus size={18} /></div>
            <h2 className="text-xl font-semibold text-[var(--text)]">Generar lote</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Selecciona los datos de producción. El código y correlativo serán generados automáticamente.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={mutation.isPending} aria-label="Cerrar"><X /></Button>
        </div>

        <form onSubmit={submit}>
          <div className="space-y-5 px-6 py-5">
            {catalogos.isLoading ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-5 text-sm text-[var(--text-secondary)]">Cargando catálogos...</div>
            ) : catalogos.isError ? (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />No se pudieron cargar los catálogos de lote.</div>
            ) : (
              <>
                <Field label="Producto" required>
                  <select className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" value={form.productoCodigo} onChange={(e) => setForm((x) => ({ ...x, productoCodigo: e.target.value }))}>
                    <option value="">Seleccionar producto</option>
                    {catalogos.data?.productos.map((x) => <option key={x.codigo} value={x.codigo}>{x.codigo} — {x.descripcion}</option>)}
                  </select>
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Naturaleza" required>
                    <select className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" value={form.naturalezaId || ""} onChange={(e) => setForm((x) => ({ ...x, naturalezaId: Number(e.target.value) }))}>
                      <option value="">Seleccionar naturaleza</option>
                      {catalogos.data?.naturalezas.map((x) => <option key={x.id} value={x.id}>{x.codigo} — {x.descripcion}</option>)}
                    </select>
                  </Field>
                  <Field label="Fase" required>
                    <select className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" value={form.faseId || ""} onChange={(e) => setForm((x) => ({ ...x, faseId: Number(e.target.value) }))}>
                      <option value="">Seleccionar fase</option>
                      {catalogos.data?.fases.map((x) => <option key={x.id} value={x.id}>{x.codigo} — {x.descripcion}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Línea de origen" required>
                  <select className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" value={form.lineaOrigenId || ""} onChange={(e) => setForm((x) => ({ ...x, lineaOrigenId: Number(e.target.value) }))}>
                    <option value="">Seleccionar línea</option>
                    {catalogos.data?.lineasOrigen.map((x) => <option key={x.id} value={x.id}>{x.codigo} — {x.descripcion}</option>)}
                  </select>
                </Field>
                <Field label="Observación">
                  <textarea className="min-h-24 w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" maxLength={500} placeholder="Observación opcional del lote" value={form.observacion ?? ""} onChange={(e) => setForm((x) => ({ ...x, observacion: e.target.value }))} />
                </Field>
                <Field label="Usuario">
                  <Input value={form.usuario} onChange={(e) => setForm((x) => ({ ...x, usuario: e.target.value }))} />
                </Field>
              </>
            )}

            {resultado && (
              <div className={`flex gap-3 rounded-lg border p-4 text-sm ${resultado.codigo ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
                {resultado.codigo ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
                <div><div className="font-semibold">{resultado.codigo ? `Lote ${resultado.codigo} generado` : "No se pudo generar"}</div><div className="mt-0.5">{resultado.mensaje}</div></div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>{resultado?.codigo ? "Cerrar" : "Cancelar"}</Button>
            {!resultado?.codigo && <Button type="submit" disabled={!valido || catalogos.isLoading || catalogos.isError || mutation.isPending}><Plus size={16} />{mutation.isPending ? "Generando..." : "Generar lote"}</Button>}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--text)]">{label}{required && <span className="ml-1 text-red-500">*</span>}</span>{children}</label>;
}
