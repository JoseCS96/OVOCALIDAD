import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, FilterX, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listarLotes } from "@/modules/lotes/api";
import type { LotesFiltros } from "@/modules/lotes/types";

const estados=[{id:1,label:"Pendiente"},{id:2,label:"En evaluación"},{id:3,label:"Liberado"},{id:4,label:"No conforme"},{id:5,label:"Certificado"},{id:6,label:"Anulado"}];
const fecha=(v:string|null)=>v?new Intl.DateTimeFormat("es-PE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"—";
const badge=(c:string)=>c==="LIBERADO"?"border-emerald-200 bg-emerald-50 text-emerald-700":c==="NO_CONFORME"||c==="ANULADO"?"border-red-200 bg-red-50 text-red-700":c==="CERTIFICADO"?"border-violet-200 bg-violet-50 text-violet-700":"border-blue-200 bg-blue-50 text-blue-700";

export default function TrazabilidadPage(){
 const nav=useNavigate(); const [draft,setDraft]=useState<LotesFiltros>({}); const [filtros,setFiltros]=useState<LotesFiltros>({}); const [page,setPage]=useState(1); const pageSize=10;
 const {data=[],isLoading,isError,isFetching,refetch}=useQuery({queryKey:["trazabilidad","lotes",filtros],queryFn:()=>listarLotes(filtros)});
 useEffect(()=>setPage(1),[filtros]);
 const ordered=useMemo(()=>[...data].sort((a,b)=>new Date(b.fechaHoraProduccion).getTime()-new Date(a.fechaHoraProduccion).getTime()),[data]);
 const totalPages=Math.max(1,Math.ceil(ordered.length/pageSize)); const rows=ordered.slice((page-1)*pageSize,page*pageSize);
 useEffect(()=>{if(page>totalPages)setPage(totalPages)},[page,totalPages]);
 const apply=()=>setFiltros({codigoLote:draft.codigoLote?.trim()||undefined,productoCodigo:draft.productoCodigo?.trim()||undefined,estadoLoteId:draft.estadoLoteId,fechaDesde:draft.fechaDesde||undefined,fechaHasta:draft.fechaHasta||undefined});
 const clear=()=>{setDraft({});setFiltros({})};
 return <PageContainer className="space-y-5">
  <PageHeader eyebrow="Sistema" title="Trazabilidad de lotes" description="Consulta y reconstrucción del historial completo de cada lote."
   actions={<Button variant="outline" onClick={()=>refetch()} disabled={isFetching}><RefreshCw size={15} className={isFetching?"animate-spin":""}/>Actualizar</Button>}/>
  <Card className="border-[var(--border)] shadow-[var(--shadow-card)]"><CardContent className="p-5">
   <div className="grid gap-3 lg:grid-cols-6">
    <div className="relative lg:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-secondary)]"/><Input className="pl-9" placeholder="Código de lote" value={draft.codigoLote??""} onChange={e=>setDraft(x=>({...x,codigoLote:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&apply()}/></div>
    <Input placeholder="Código de producto" value={draft.productoCodigo??""} onChange={e=>setDraft(x=>({...x,productoCodigo:e.target.value}))}/>
    <select className="h-9 rounded-md border border-[var(--border)] bg-white px-3 text-sm" value={draft.estadoLoteId??""} onChange={e=>setDraft(x=>({...x,estadoLoteId:e.target.value?Number(e.target.value):undefined}))}><option value="">Todos los estados</option>{estados.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select>
    <Button onClick={apply}><Search size={15}/>Buscar</Button><Button variant="outline" onClick={clear}><FilterX size={15}/>Limpiar</Button>
    <Input type="date" value={draft.fechaDesde??""} onChange={e=>setDraft(x=>({...x,fechaDesde:e.target.value}))}/>
    <Input type="date" value={draft.fechaHasta??""} onChange={e=>setDraft(x=>({...x,fechaHasta:e.target.value}))}/>
   </div>
  </CardContent></Card>
  <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-card)]"><CardContent className="p-0">
   <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
    <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[.08em] text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Lote / producto</th><th className="px-5 py-3">Producción</th><th className="px-5 py-3">ET aplicada</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Evaluaciones</th><th className="px-5 py-3">Última actividad</th><th className="px-5 py-3 text-right">Acción</th></tr></thead>
    <tbody>{isLoading?<tr><td colSpan={7} className="p-12 text-center text-slate-500">Cargando trazabilidad...</td></tr>:isError?<tr><td colSpan={7} className="p-12 text-center text-red-600">No se pudo consultar los lotes.</td></tr>:rows.length===0?<tr><td colSpan={7} className="p-12 text-center text-slate-500">No existen lotes para los filtros seleccionados.</td></tr>:rows.map(l=><tr key={l.loteId} className="border-t border-[var(--border)] hover:bg-[var(--surface-muted)]/60">
     <td className="px-5 py-4"><p className="font-semibold">{l.codigoLote}</p><p className="mt-1 max-w-[320px] truncate text-xs text-[var(--text-secondary)]">{l.productoCodigo} · {l.productoDescripcion}</p></td>
     <td className="px-5 py-4">{fecha(l.fechaHoraProduccion)}</td><td className="px-5 py-4"><p className="font-medium">V{l.versionNumero}</p><p className="text-xs text-slate-500">Versión ID {l.versionId}</p></td>
     <td className="px-5 py-4"><Badge variant="outline" className={badge(l.estadoLoteCodigo)}>{l.estadoLoteDescripcion}</Badge></td>
     <td className="px-5 py-4"><p className="font-medium">{l.totalEvaluaciones} intento(s)</p><p className="text-xs text-slate-500">{l.evaluacionesTerminadas} terminada(s)</p></td>
     <td className="px-5 py-4 text-xs">{fecha(l.audFechaActualizacion||l.audFechaCreacion)}</td>
     <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={()=>nav(`/trazabilidad/${l.loteId}`)}><Eye size={15}/>Ver trazabilidad</Button></td>
    </tr>)}</tbody>
   </table></div>
   {!isLoading&&!isError&&data.length>0&&<div className="flex items-center justify-between border-t px-5 py-3"><p className="text-xs text-slate-500">Mostrando <b>{(page-1)*pageSize+1}–{Math.min(page*pageSize,data.length)}</b> de <b>{data.length}</b> lotes</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(x=>x-1)}><ChevronLeft size={15}/>Anterior</Button><span className="text-xs text-slate-500">Página {page} de {totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(x=>x+1)}>Siguiente<ChevronRight size={15}/></Button></div></div>}
  </CardContent></Card>
 </PageContainer>;
}
