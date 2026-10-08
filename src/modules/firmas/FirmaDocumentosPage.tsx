import {useMemo,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {CheckCircle2,Clock3,FileCheck2,Search} from "lucide-react";
import {useNavigate,useSearchParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {listarMisSolicitudesFirma} from "./api";

export default function FirmaDocumentosPage(){
 const nav=useNavigate();
 const [params,setParams]=useSearchParams();
 const tab=params.get("tab")==="firmados"?"firmados":"pendientes";
 const [buscar,setBuscar]=useState("");

 const q=useQuery({
  queryKey:["mis-firmas",tab],
  queryFn:()=>listarMisSolicitudesFirma(tab==="pendientes"?"PENDIENTE":"FIRMADO")
 });

 const items=useMemo(()=>{
  const t=buscar.trim().toLowerCase();
  if(!t)return q.data??[];
  return (q.data??[]).filter(x=>[
   x.documentoCodigo,x.documentoDescripcion,x.tipoResponsabilidad,x.cargoDescripcion
  ].some(v=>String(v??"").toLowerCase().includes(t)));
 },[q.data,buscar]);

 return <PageContainer className="space-y-5">
  <div>
   <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--primary)]">Firma documental</p>
   <h1 className="mt-1 text-2xl font-semibold">Firma de documentos</h1>
   <p className="mt-1 text-sm text-[var(--text-secondary)]">Documentos de calidad asignados a tu usuario para revisión y firma.</p>
  </div>

  <div className="flex gap-2 rounded-xl border bg-white p-2">
   <Button variant={tab==="pendientes"?"default":"ghost"} onClick={()=>setParams({tab:"pendientes"})}><Clock3/>Pendientes</Button>
   <Button variant={tab==="firmados"?"default":"ghost"} onClick={()=>setParams({tab:"firmados"})}><CheckCircle2/>Firmados</Button>
  </div>

  <Card><CardContent className="p-4">
   <div className="relative">
    <Search className="absolute left-3 top-2.5 size-4 text-slate-400"/>
    <Input className="pl-9" placeholder="Buscar documento, código o responsabilidad..." value={buscar} onChange={e=>setBuscar(e.target.value)}/>
   </div>
  </CardContent></Card>

  <Card><CardContent className="p-0">
   {q.isLoading?<div className="p-10 text-center text-sm">Cargando solicitudes...</div>:
   !items.length?<div className="p-14 text-center"><FileCheck2 className="mx-auto size-9 text-slate-300"/><h2 className="mt-3 font-semibold">{tab==="pendientes"?"No tienes firmas pendientes":"Aún no tienes documentos firmados"}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{tab==="pendientes"?"Cuando una ET, FT o certificado requiera tu firma aparecerá aquí.":"Tus documentos firmados quedarán disponibles para consulta."}</p></div>:
   <div className="overflow-x-auto">
    <table className="w-full min-w-[900px] text-sm">
     <thead className="border-b bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]">
      <tr><th className="px-5 py-3">Documento</th><th className="px-4">Responsabilidad</th><th className="px-4">Solicitud</th><th className="px-4">Estado</th><th className="px-5 text-right">Acción</th></tr>
     </thead>
     <tbody>{items.map(x=><tr key={x.documentoFirmaSolicitudId} className="border-b last:border-0">
      <td className="px-5 py-4"><div className="font-semibold">{x.documentoCodigo}</div><div className="mt-1 text-xs text-[var(--text-secondary)]">{x.documentoDescripcion}{x.versionNumero!=null?` · v${x.versionNumero}`:""}</div></td>
      <td className="px-4 py-4"><div className="font-medium">{x.tipoResponsabilidad.replaceAll("_"," ")}</div><div className="mt-1 text-xs text-[var(--text-secondary)]">{x.cargoDescripcion??"—"}</div></td>
      <td className="px-4 py-4">{fechaHora(x.fechaSolicitud)}</td>
      <td className="px-4 py-4">{x.estadoSolicitud==="FIRMADO"?<Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Firmado</Badge>:<Badge variant="outline">Pendiente</Badge>}</td>
      <td className="px-5 py-4 text-right"><Button size="sm" variant={x.estadoSolicitud==="PENDIENTE"?"default":"outline"} onClick={()=>x.urlDocumento&&nav(x.urlDocumento)}>{x.estadoSolicitud==="PENDIENTE"?"Ver y firmar":"Ver documento"}</Button></td>
     </tr>)}</tbody>
    </table>
   </div>}
  </CardContent></Card>
 </PageContainer>;
}

function fechaHora(v:string|null){
 if(!v)return "—";
 return new Date(v).toLocaleString("es-PE",{dateStyle:"short",timeStyle:"short"});
}
