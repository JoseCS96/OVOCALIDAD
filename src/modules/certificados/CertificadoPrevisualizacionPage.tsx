import {useMutation,useQuery} from "@tanstack/react-query";
import {ArrowLeft,FileCheck2} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import CertificadoDocumento from "./components/CertificadoDocumento";
import {emitirCertificado,previsualizarCertificado} from "./api";

export default function CertificadoPrevisualizacionPage(){
 const nav=useNavigate();
 const {loteId,plantillaId}=useParams();
 const l=Number(loteId),p=Number(plantillaId);
 const q=useQuery({queryKey:["certificado-preview",l,p],queryFn:()=>previsualizarCertificado(l,p),enabled:l>0&&p>0});
 const emitir=useMutation({
  mutationFn:()=>emitirCertificado(l,p),
  onSuccess:r=>nav(`/certificacion/certificados/emitidos/${r.certificadoId}`,{replace:true})
 });

 if(q.isLoading)return <PageContainer><div className="py-16 text-center">Generando previsualización...</div></PageContainer>;
 if(q.isError||!q.data)return <PageContainer><div className="py-16 text-center text-red-600">{q.error instanceof Error?q.error.message:"No se pudo generar la previsualización."}</div></PageContainer>;

 return <PageContainer className="space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
   <Button variant="ghost" onClick={()=>nav(-1)}><ArrowLeft/>Volver</Button>
   <Button disabled={emitir.isPending} onClick={()=>{if(window.confirm("¿Emitir definitivamente este certificado?"))emitir.mutate()}}>
    <FileCheck2/>{emitir.isPending?"Emitiendo...":"Emitir certificado"}
   </Button>
  </div>
  <div className="print:hidden"><h1 className="text-2xl font-semibold">Previsualización del certificado</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Revisa el documento antes de emitirlo. Al emitir se guardará un snapshot histórico.</p></div>
  {emitir.isError&&<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{emitir.error instanceof Error?emitir.error.message:"No se pudo emitir el certificado."}</div>}
  <CertificadoDocumento data={q.data}/>
 </PageContainer>;
}
