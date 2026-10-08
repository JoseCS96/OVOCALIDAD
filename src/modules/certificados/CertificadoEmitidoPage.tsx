import {useQuery} from "@tanstack/react-query";
import {ArrowLeft,Printer} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import CertificadoDocumento from "./components/CertificadoDocumento";
import {obtenerCertificadoEmitido} from "./api";

export default function CertificadoEmitidoPage(){
 const nav=useNavigate();
 const {certificadoId}=useParams();
 const id=Number(certificadoId);
 const q=useQuery({queryKey:["certificado-emitido",id],queryFn:()=>obtenerCertificadoEmitido(id),enabled:id>0});

 if(q.isLoading)return <PageContainer><div className="py-16 text-center">Cargando certificado...</div></PageContainer>;
 if(q.isError||!q.data)return <PageContainer><div className="py-16 text-center text-red-600">No se pudo cargar el certificado emitido.</div></PageContainer>;

 return <PageContainer className="space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
   <div>
    <Button variant="ghost" className="-ml-2 mb-2" onClick={()=>nav("/certificacion/certificados?tab=emitidos")}><ArrowLeft/>Volver a certificados</Button>
    <h1 className="text-2xl font-semibold">Certificado emitido</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{q.data.cabecera.numeroCertificado} · Lote {q.data.cabecera.codigoLote}</p>
   </div>
   <Button onClick={()=>window.print()}><Printer/>Imprimir</Button>
  </div>
  <CertificadoDocumento data={q.data}/>
 </PageContainer>;
}
