import {useMutation,useQuery} from "@tanstack/react-query";
import {ArrowLeft,Download} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import CertificadoDocumento from "./components/CertificadoDocumento";
import {descargarCertificadoPdf,obtenerCertificadoEmitido} from "./api";

export default function CertificadoEmitidoPage(){
 const nav=useNavigate();
 const {certificadoId}=useParams();
 const id=Number(certificadoId);
 const q=useQuery({queryKey:["certificado-emitido",id],queryFn:()=>obtenerCertificadoEmitido(id),enabled:id>0});

 const descargar=useMutation({
  mutationFn:()=>descargarCertificadoPdf(
   id,
   `${q.data?.cabecera.numeroCertificado??`certificado-${id}`}-${q.data?.cabecera.codigoLote??"lote"}.pdf`
  )
 });

 if(q.isLoading)return <PageContainer><div className="py-16 text-center">Cargando certificado...</div></PageContainer>;
 if(q.isError||!q.data)return <PageContainer><div className="py-16 text-center text-red-600">No se pudo cargar el certificado emitido.</div></PageContainer>;

 return <PageContainer className="space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
   <div>
    <Button variant="ghost" className="-ml-2 mb-2" onClick={()=>nav("/certificacion/certificados?tab=emitidos")}><ArrowLeft/>Volver a certificados</Button>
    <h1 className="text-2xl font-semibold">Certificado emitido</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{q.data.cabecera.numeroCertificado} · Lote {q.data.cabecera.codigoLote}</p>
   </div>
   <Button disabled={descargar.isPending} onClick={()=>descargar.mutate()}><Download/>{descargar.isPending?"Descargando...":"Descargar PDF"}</Button>
  </div>
  {descargar.isError&&<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">No se pudo descargar el PDF del certificado.</div>}
  <CertificadoDocumento data={q.data}/>
 </PageContainer>;
}
