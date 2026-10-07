import {useState} from "react";
import {FileCheck2,Search} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

export default function FichasTecnicasPage(){
 const nav=useNavigate(),[versionId,setVersionId]=useState("");
 const abrir=()=>{const id=Number(versionId);if(id>0)nav(`/documentos/fichas-tecnicas/${id}/editar`)};
 return <PageContainer className="space-y-4">
  <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental</p><h1 className="mt-1 text-2xl font-semibold">Fichas técnicas</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Configura la estructura propia de la FT y los parámetros que participarán en el certificado.</p></div>
  <Card><CardContent className="p-6">
   <div className="flex items-start gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100"><FileCheck2 className="size-5"/></div><div className="min-w-0 flex-1"><h2 className="font-semibold">Abrir una versión de ficha técnica</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">La bandeja general se conectará cuando definamos su SP de listado. El editor ya trabaja directamente con cualquier VersionId de FT válido.</p>
   <div className="mt-4 flex max-w-md gap-2"><div className="relative flex-1"><Search className="absolute left-2.5 top-2 size-4 text-[var(--text-secondary)]"/><Input className="pl-8" inputMode="numeric" placeholder="VersionId, ej. 31" value={versionId} onChange={e=>setVersionId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&abrir()}/></div><Button disabled={!Number(versionId)} onClick={abrir}>Abrir FT</Button></div>
   </div></div>
  </CardContent></Card>
 </PageContainer>
}
