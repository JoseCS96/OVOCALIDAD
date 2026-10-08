import {useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {ArrowLeft,LoaderCircle} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {obtenerDetalleLote} from "@/modules/lotes/api";
import {obtenerPlantillaPredeterminada} from "./api";

export default function CertificadoEmisionPage(){
 const nav=useNavigate();
 const {loteId}=useParams();
 const id=Number(loteId);

 const lote=useQuery({
  queryKey:["lote-certificado",id],
  queryFn:()=>obtenerDetalleLote(id),
  enabled:id>0
 });

 const plantilla=useQuery({
  queryKey:["certificado-plantilla-predeterminada",id],
  queryFn:()=>obtenerPlantillaPredeterminada(id),
  enabled:id>0&&lote.data?.lote.estadoCertificacionCodigo==="LISTO_PARA_CERTIFICADO",
  retry:false
 });

 useEffect(()=>{
  if(plantilla.data?.certificadoPlantillaId){
   nav(
    `/certificacion/certificados/previsualizar/${id}/${plantilla.data.certificadoPlantillaId}`,
    {replace:true}
   );
  }
 },[id,nav,plantilla.data?.certificadoPlantillaId]);

 if(lote.isLoading)return <PageContainer><Estado texto="Cargando lote..."/></PageContainer>;

 if(lote.isError||!lote.data)return <PageContainer>
  <Estado texto="No se pudo cargar el lote." error/>
 </PageContainer>;

 const l=lote.data.lote;

 if(l.estadoCertificacionCodigo!=="LISTO_PARA_CERTIFICADO"){
  return <PageContainer className="space-y-4">
   <Button variant="ghost" className="-ml-2" onClick={()=>nav("/operacion/lotes")}><ArrowLeft/>Volver a lotes</Button>
   <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
    Este lote no está disponible para una nueva emisión de certificado.
   </div>
  </PageContainer>;
 }

 if(plantilla.isError){
  return <PageContainer className="space-y-4">
   <Button variant="ghost" className="-ml-2" onClick={()=>nav("/operacion/lotes")}><ArrowLeft/>Volver a lotes</Button>
   <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
    <h1 className="text-lg font-semibold text-amber-900">No hay una plantilla predeterminada disponible</h1>
    <p className="mt-2 text-sm text-amber-800">
     El producto {l.productoCodigo} necesita una plantilla predeterminada antes de emitir certificados.
    </p>
    <Button className="mt-4" variant="outline" onClick={()=>nav("/documentos/diseno-certificados?tab=plantillas")}>
     Ir a Diseño de certificados
    </Button>
   </div>
  </PageContainer>;
 }

 return <PageContainer>
  <Estado texto="Preparando certificado con la plantilla predeterminada..."/>
 </PageContainer>;
}

function Estado({texto,error=false}:{texto:string;error?:boolean}){
 return <div className={"flex min-h-[260px] items-center justify-center gap-3 text-sm "+(error?"text-red-600":"text-[var(--text-secondary)]")}>
  {!error&&<LoaderCircle className="size-5 animate-spin"/>}
  {texto}
 </div>;
}
