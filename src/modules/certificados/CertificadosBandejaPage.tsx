import {useMemo,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {ArrowDownUp, FileCheck2, LayoutTemplate, Settings, Search} from "lucide-react";
import {useNavigate,useSearchParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {listarLotes} from "@/modules/lotes/api";
import {useAuth} from "@/modules/auth/AuthContext";
import type {LoteListado} from "@/modules/lotes/types";

type Tab="por-emitir"|"emitidos";
type SortKey="codigoLote"|"productoCodigo"|"fechaHoraProduccion"|"estadoCertificacionDescripcion";
type SortDirection="asc"|"desc";

export default function CertificadosBandejaPage(){
 const nav=useNavigate();
 const {tienePermiso}=useAuth();
 const puedeEmitir=tienePermiso("CERTIFICADO.EMITIR");
 const [params,setParams]=useSearchParams();
 const tab=(params.get("tab")==="emitidos"?"emitidos":"por-emitir") as Tab;
 const [busqueda,setBusqueda]=useState("");
 const [sortKey,setSortKey]=useState<SortKey>("fechaHoraProduccion");
 const [sortDirection,setSortDirection]=useState<SortDirection>("desc");
 const [page,setPage]=useState(1);
 const pageSize=10;

 const q=useQuery({queryKey:["certificados-bandeja-lotes"],queryFn:()=>listarLotes({})});

 const porEmitir=useMemo(()=>q.data?.filter(x=>x.estadoCertificacionCodigo==="LISTO_PARA_CERTIFICADO")??[],[q.data]);
 const emitidos=useMemo(()=>q.data?.filter(x=>x.estadoCertificacionCodigo==="CERTIFICADO_EMITIDO")??[],[q.data]);
 const fuente=tab==="por-emitir"?porEmitir:emitidos;
 const filtrados=useMemo(()=>{
  const term=busqueda.trim().toLocaleLowerCase();
  const data=!term?fuente:fuente.filter(x=>[x.codigoLote,x.productoCodigo,x.productoDescripcion,x.numeroCertificado??""].some(v=>String(v??"").toLocaleLowerCase().includes(term)));
  return [...data].sort((a,b)=>{
   const left=sortKey==="fechaHoraProduccion"?new Date(a.fechaHoraProduccion).getTime():String(a[sortKey]??"");
   const right=sortKey==="fechaHoraProduccion"?new Date(b.fechaHoraProduccion).getTime():String(b[sortKey]??"");
   const cmp=typeof left==="number"&&typeof right==="number"?left-right:String(left).localeCompare(String(right),"es",{numeric:true,sensitivity:"base"});
   return sortDirection==="asc"?cmp:-cmp;
  });
 },[fuente,busqueda,sortKey,sortDirection]);

 const totalPages=Math.max(1,Math.ceil(filtrados.length/pageSize));
 const visibles=filtrados.slice((page-1)*pageSize,page*pageSize);
 const cambiarTab=(next:Tab)=>{setParams({tab:next});setPage(1)};
 const ordenar=(key:SortKey)=>{if(sortKey===key)setSortDirection(x=>x==="asc"?"desc":"asc");else{setSortKey(key);setSortDirection("asc")}setPage(1)};

 return <PageContainer className="space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div>
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Certificación</p>
    <h1 className="mt-1 text-2xl font-semibold">Certificados</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">Control de lotes listos para certificar y certificados emitidos.</p>
   </div>
   <div className="flex gap-2">
    <Button variant="outline" className="bg-white" onClick={()=>nav("/documentos/diseno-certificados?tab=plantillas")}><LayoutTemplate size={16}/>Plantillas</Button>
    <Button variant="outline" className="bg-white" onClick={()=>nav("/documentos/diseno-certificados?tab=configuracion")}><Settings size={16}/>Configuración</Button>
   </div>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
   <button type="button" onClick={()=>cambiarTab("por-emitir")} className={"rounded-xl border p-5 text-left transition "+(tab==="por-emitir"?"border-emerald-300 bg-emerald-50/60":"bg-white hover:bg-slate-50")}>
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Por emitir</div><div className="mt-2 text-3xl font-semibold">{porEmitir.length}</div><div className="mt-1 text-sm text-slate-600">Lotes liberados listos para certificado</div>
   </button>
   <button type="button" onClick={()=>cambiarTab("emitidos")} className={"rounded-xl border p-5 text-left transition "+(tab==="emitidos"?"border-violet-300 bg-violet-50/60":"bg-white hover:bg-slate-50")}>
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Emitidos</div><div className="mt-2 text-3xl font-semibold">{emitidos.length}</div><div className="mt-1 text-sm text-slate-600">Certificados ya emitidos</div>
   </button>
  </div>

  <Card>
   <CardContent className="p-0">
    <div className="flex flex-wrap gap-3 border-b p-4">
     <div className="relative min-w-[260px] flex-1"><Search className="absolute left-3 top-2.5 size-4 text-slate-400"/><Input className="pl-9" placeholder="Buscar lote, producto o certificado" value={busqueda} onChange={e=>{setBusqueda(e.target.value);setPage(1)}}/></div>
    </div>
    {q.isLoading?<div className="p-10 text-center text-sm">Cargando certificados...</div>:q.isError?<div className="p-10 text-center text-sm text-red-600">No se pudo cargar la bandeja de certificados.</div>:filtrados.length===0?<div className="p-12 text-center"><FileCheck2 className="mx-auto mb-3 size-8 text-slate-300"/><p className="font-medium">{tab==="por-emitir"?"No hay lotes listos para certificado":"No hay certificados emitidos"}</p></div>:
    <>
     <div className="h-[calc(100vh-460px)] min-h-[320px] max-h-[520px] overflow-auto">
      <table className="w-full min-w-[1000px] text-sm">
       <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>
        <Th label="Lote" active={sortKey==="codigoLote"} onClick={()=>ordenar("codigoLote")}/>
        <Th label="Producto" active={sortKey==="productoCodigo"} onClick={()=>ordenar("productoCodigo")}/>
        <Th label="Producción" active={sortKey==="fechaHoraProduccion"} onClick={()=>ordenar("fechaHoraProduccion")}/>
        <Th label="Certificación" active={sortKey==="estadoCertificacionDescripcion"} onClick={()=>ordenar("estadoCertificacionDescripcion")}/>
        <th className="px-4 py-3 text-right">Acciones</th>
       </tr></thead>
       <tbody>{visibles.map(l=><Fila key={l.loteId} lote={l} tab={tab} puedeEmitir={puedeEmitir} onEmitir={()=>nav(`/certificacion/certificados/emitir/${l.loteId}`)} onVer={()=>nav(`/operacion/lotes/${l.loteId}`)}/>)}</tbody>
      </table>
     </div>
     <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">Mostrando <b>{(page-1)*pageSize+1}</b>–<b>{Math.min(page*pageSize,filtrados.length)}</b> de <b>{filtrados.length}</b></p>
      <div className="flex gap-2"><Button size="sm" variant="outline" className="bg-white" disabled={page===1} onClick={()=>setPage(x=>Math.max(1,x-1))}>Anterior</Button><span className="px-2 py-2 text-xs">Página {page} de {totalPages}</span><Button size="sm" variant="outline" className="bg-white" disabled={page===totalPages} onClick={()=>setPage(x=>Math.min(totalPages,x+1))}>Siguiente</Button></div>
     </div>
    </>}
   </CardContent>
  </Card>
 </PageContainer>;
}

function Th({label,active,onClick}:{label:string;active:boolean;onClick:()=>void}){return <th className="px-4 py-3"><button type="button" className="inline-flex items-center gap-1.5 font-semibold uppercase" onClick={onClick}>{label}<ArrowDownUp size={13} className={active?"text-[var(--primary)]":"opacity-40"}/></button></th>}
function Fila({lote,tab,puedeEmitir,onEmitir,onVer}:{lote:LoteListado;tab:Tab;puedeEmitir:boolean;onEmitir:()=>void;onVer:()=>void}){return <tr className="border-t">
 <td className="px-4 py-4"><div className="font-semibold">{lote.codigoLote}</div><div className="mt-1 text-xs text-slate-500">ID {lote.loteId}</div></td>
 <td className="px-4 py-4"><div className="font-medium">{lote.productoCodigo}</div><div className="mt-1 max-w-[360px] truncate text-xs text-slate-500">{lote.productoDescripcion}</div></td>
 <td className="px-4 py-4">{new Date(lote.fechaHoraProduccion).toLocaleString("es-PE")}</td>
 <td className="px-4 py-4">{tab==="por-emitir"?<Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Listo para certificado</Badge>:<div><Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">Certificado emitido</Badge>{lote.numeroCertificado&&<div className="mt-1 text-xs text-slate-500">{lote.numeroCertificado}</div>}</div>}</td>
 <td className="px-4 py-4"><div className="flex justify-end gap-2">{tab==="por-emitir"&&puedeEmitir&&<Button size="sm" onClick={onEmitir}><FileCheck2 size={14}/>Emitir certificado</Button>}<Button size="sm" variant="outline" className="bg-white" onClick={onVer}>Ver lote</Button></div></td>
 </tr>}
