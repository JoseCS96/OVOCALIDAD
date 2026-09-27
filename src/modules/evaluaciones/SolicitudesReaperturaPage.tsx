import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, RefreshCw, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/AuthContext";
import { listarSolicitudesReapertura, obtenerSolicitudReapertura, resolverSolicitudReapertura } from "./api";
import type { SolicitudReaperturaItem } from "./types";

function fecha(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function SolicitudesReaperturaPage() {
  const { tienePermiso } = useAuth();
  const queryClient = useQueryClient();
  const autorizado = tienePermiso("EVALUACION.AUTORIZAR_REAPERTURA");
  const [estado, setEstado] = useState("PENDIENTE");
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [observacion, setObservacion] = useState("");

  const lista = useQuery({
    queryKey: ["evaluaciones", "reaperturas", estado],
    queryFn: () => listarSolicitudesReapertura(estado),
    enabled: autorizado,
  });

  const detalle = useQuery({
    queryKey: ["evaluaciones", "reaperturas", "detalle", seleccionada],
    queryFn: () => obtenerSolicitudReapertura(seleccionada!),
    enabled: autorizado && seleccionada !== null,
  });

  const resolver = useMutation({
    mutationFn: ({ id, aprobar }: { id: number; aprobar: boolean }) =>
      resolverSolicitudReapertura(id, { aprobar, observacion: observacion.trim() || null }),
    onSuccess: async () => {
      setSeleccionada(null);
      setObservacion("");
      await queryClient.invalidateQueries({ queryKey: ["evaluaciones", "reaperturas"] });
      await queryClient.invalidateQueries({ queryKey: ["evaluaciones", "mi-panel"] });
      await queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });

  function abrir(item: SolicitudReaperturaItem) {
    setSeleccionada(item.solicitudReaperturaId);
    setObservacion("");
  }

  if (!autorizado) return <PageContainer><div className="py-20 text-center text-sm text-[var(--text-secondary)]">No tienes permiso para autorizar reaperturas.</div></PageContainer>;

  const d = detalle.data;

  return <PageContainer className="space-y-5">
    <PageHeader eyebrow="Operación · Calidad" title="Solicitudes de reapertura" description="Revisa, autoriza o rechaza solicitudes. Cada apertura y decisión queda auditada." actions={<Button variant="outline" onClick={() => lista.refetch()} disabled={lista.isFetching}><RefreshCw size={15} className={lista.isFetching ? "animate-spin" : ""}/>Actualizar</Button>} />

    <div className="flex flex-wrap gap-2">{["PENDIENTE","APROBADA","RECHAZADA"].map(x => <Button key={x} size="sm" variant={estado === x ? "default" : "outline"} onClick={() => { setEstado(x); setSeleccionada(null); }}>{x}</Button>)}</div>

    <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]">
      <CardHeader className="border-b border-[var(--border)]"><CardTitle className="text-base">Bandeja de reaperturas</CardTitle><p className="text-xs text-[var(--text-secondary)]">Usuarios con permiso EVALUACION.AUTORIZAR_REAPERTURA.</p></CardHeader>
      <CardContent className="p-0">
        {lista.isLoading ? <div className="py-12 text-center text-sm">Cargando solicitudes...</div> : lista.isError ? <div className="py-12 text-center text-sm text-red-600">No se pudo cargar la bandeja.</div> : !lista.data?.length ? <div className="py-12 text-center text-sm text-[var(--text-secondary)]">No hay solicitudes en este estado.</div> :
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-[11px] uppercase tracking-[.08em] text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Lote / producto</th><th className="px-5 py-3">Solicitante</th><th className="px-5 py-3">Motivo</th><th className="px-5 py-3">Solicitud</th><th className="px-5 py-3">Lectura</th><th className="px-5 py-3 text-right">Acción</th></tr></thead>
          <tbody>{lista.data.map(item => <tr key={item.solicitudReaperturaId} className="border-t border-[var(--border)]">
            <td className="px-5 py-4"><p className="font-semibold">{item.codigoLote}</p><p className="text-xs text-[var(--text-secondary)]">{item.productoCodigo} · {item.productoDescripcion}</p></td>
            <td className="px-5 py-4"><p className="font-medium">{item.usuarioSolicitante}</p><p className="text-xs text-[var(--text-secondary)]">Evaluador: {item.usuarioEvaluador ?? "—"}</p></td>
            <td className="max-w-[300px] px-5 py-4"><p className="truncate">{item.motivoSolicitud}</p></td>
            <td className="px-5 py-4"><p>{fecha(item.fechaSolicitud)}</p><Badge variant="outline" className="mt-1">{item.estadoSolicitud}</Badge></td>
            <td className="px-5 py-4">{item.leidaPorMi ? <span className="text-xs text-emerald-700">Revisada · {item.totalLecturas}</span> : <span className="text-xs font-medium text-amber-700">Sin revisar</span>}</td>
            <td className="px-5 py-4 text-right"><Button size="sm" variant="outline" onClick={() => abrir(item)}><Eye size={14}/>Revisar</Button></td>
          </tr>)}</tbody>
        </table></div>}
      </CardContent>
    </Card>

    {seleccionada !== null && <Card className="border-[var(--border)] shadow-[var(--shadow-card)]">
      <CardHeader className="border-b border-[var(--border)]"><CardTitle className="flex items-center gap-2 text-base"><RotateCcw size={17}/>Detalle de solicitud #{seleccionada}</CardTitle></CardHeader>
      <CardContent className="space-y-5 p-5">
        {detalle.isLoading ? <p className="text-sm text-[var(--text-secondary)]">Registrando lectura y cargando detalle...</p> : detalle.isError || !d ? <p className="text-sm text-red-600">No se pudo obtener la solicitud.</p> : <>
          <div className="grid gap-3 md:grid-cols-4">
            <div><p className="text-xs text-[var(--text-secondary)]">Lote</p><p className="font-semibold">{d.codigoLote}</p></div>
            <div><p className="text-xs text-[var(--text-secondary)]">Producto</p><p className="font-semibold">{d.productoCodigo}</p><p className="text-xs text-[var(--text-secondary)]">{d.productoDescripcion}</p></div>
            <div><p className="text-xs text-[var(--text-secondary)]">Solicitó</p><p className="font-semibold">{d.usuarioSolicitante}</p><p className="text-xs text-[var(--text-secondary)]">{fecha(d.fechaSolicitud)}</p></div>
            <div><p className="text-xs text-[var(--text-secondary)]">Estado</p><Badge variant="outline">{d.estadoSolicitud}</Badge></div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><p className="mb-1 text-xs font-medium text-[var(--text-secondary)]">Motivo de reapertura</p><p className="text-sm">{d.motivoSolicitud}</p></div>
          <div><p className="mb-2 text-sm font-semibold">Auditoría de lectura</p><div className="space-y-2">{d.lecturas.map(x => <div key={x.solicitudReaperturaLecturaId} className="flex justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-xs"><span>{x.usuarioLectura}</span><span className="text-[var(--text-secondary)]">{fecha(x.fechaLectura)}</span></div>)}</div></div>
          {d.estadoSolicitud === "PENDIENTE" ? <>
            <div><label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Observación de la decisión</label><textarea value={observacion} onChange={e => setObservacion(e.target.value)} maxLength={1000} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" placeholder="Opcional al autorizar; obligatoria al rechazar."/></div>
            {resolver.isError && <p className="text-sm text-red-600">{resolver.error instanceof Error ? resolver.error.message : "No se pudo resolver la solicitud."}</p>}
            <div className="flex justify-end gap-2"><Button variant="outline" disabled={resolver.isPending || !observacion.trim()} onClick={() => resolver.mutate({id:d.solicitudReaperturaId,aprobar:false})}><XCircle size={15}/>Rechazar</Button><Button disabled={resolver.isPending} onClick={() => resolver.mutate({id:d.solicitudReaperturaId,aprobar:true})}><CheckCircle2 size={15}/>Autorizar reapertura</Button></div>
          </> : <div className="rounded-xl border border-[var(--border)] p-4 text-sm"><p><strong>Resuelto por:</strong> {d.usuarioRespuesta ?? "—"} · {fecha(d.fechaRespuesta)}</p>{d.observacionRespuesta && <p className="mt-1 text-[var(--text-secondary)]">{d.observacionRespuesta}</p>}</div>}
        </>}
      </CardContent>
    </Card>}
  </PageContainer>;
}
