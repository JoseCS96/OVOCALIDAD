import {useMemo,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {ArrowLeft,CheckCircle2,FileCheck2} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {obtenerDetalleLote} from "@/modules/lotes/api";
import {listarPlantillas} from "./api";

export default function CertificadoEmisionPage(){
 const nav=useNavigate();
 const {loteId}=useParams();
 const id=Number(loteId);
 const lote=useQuery({queryKey:["lote-certificado",id],queryFn:()=>obtenerDetalleLote(id),enabled:id>0});
 const producto=lote.data?.lote.productoCodigo;
 const plantillas=useQuery({
  queryKey:["certificado-plantillas-emision",producto],
  queryFn:()=>listarPlantillas(undefined,producto),
  enabled:!!producto
 });
 const [plantillaId,setPlantillaId]=useState<number|null>(null);
 const plantilla=useMemo(()=>plantillas.data?.find(x=>x.certificadoPlantillaId===plantillaId)??null,[plantillas.data,plantillaId]);

 if(lote.isLoading)return <PageContainer><div className="py-16 text-center">Cargando lote...</div></PageContainer>;
 if(lote.isError||!lote.data)return <PageContainer><div className="py-16 text-center text-red-600">No se pudo cargar el lote.</div></PageContainer>;

 const l=lote.data.lote;
 const listo=l.estadoCertificacionCodigo==="LISTO_PARA_CERTIFICADO";

 return <PageContainer className="space-y-5">
  <Button variant="ghost" size="sm" className="-ml-2" onClick={()=>nav("/operacion/lotes")}><ArrowLeft/>Volver a lotes</Button>

  <div>
   <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Certificación · Emisión</p>
   <h1 className="mt-1 text-2xl font-semibold">Emitir certificado</h1>
   <p className="mt-1 text-sm text-[var(--text-secondary)]">Preparación del certificado para el lote {l.codigoLote}.</p>
  </div>

  <Card><CardContent className="p-5">
   <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
     <div className="text-xl font-semibold">{l.codigoLote}</div>
     <div className="mt-1 text-sm text-[var(--text-secondary)]">{l.productoCodigo} · {l.productoDescripcion}</div>
    </div>
    <div className="flex flex-wrap gap-2">
     <Badge variant="outline">{l.estadoLoteDescripcion}</Badge>
     <Badge variant="outline" className={listo?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-slate-200 bg-slate-50 text-slate-600"}>{l.estadoCertificacionDescripcion}</Badge>
    </div>
   </div>
   <div className="mt-5 grid gap-4 md:grid-cols-4 text-sm">
    <Info label="Producción" value={new Date(l.fechaHoraProduccion).toLocaleString("es-PE")}/>
    <Info label="Línea" value={l.lineaOrigenCodigo}/>
    <Info label="Fase" value={l.faseDescripcion||l.faseCodigo}/>
    <Info label="Avance evaluación" value={`${Number(l.porcentajeAvance??0).toFixed(0)}%`}/>
   </div>
  </CardContent></Card>

  {!listo?<Card><CardContent className="p-6 text-sm text-amber-700">Este lote no está disponible para una nueva emisión de certificado.</CardContent></Card>:
  <Card><CardContent className="space-y-4 p-5">
   <div>
    <h2 className="font-semibold">Plantilla de certificado</h2>
    <p className="text-sm text-[var(--text-secondary)]">Selecciona una plantilla configurada para el producto {l.productoCodigo}.</p>
   </div>
   <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={plantillaId??""} onChange={e=>setPlantillaId(e.target.value?Number(e.target.value):null)}>
    <option value="">{plantillas.isLoading?"Cargando plantillas...":"Seleccionar plantilla"}</option>
    {plantillas.data?.map(x=><option key={x.certificadoPlantillaId} value={x.certificadoPlantillaId}>{x.nombre} · {x.documentoCodigo} · v{x.versionNumero}</option>)}
   </select>
   {plantillas.isError&&<p className="text-sm text-red-600">No se pudieron cargar las plantillas disponibles.</p>}
   {!plantillas.isLoading&&!plantillas.isError&&!plantillas.data?.length&&<p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No existe una plantilla activa para este producto. Debes crear o configurar una antes de emitir.</p>}
   {plantilla&&<div className="rounded-lg border bg-slate-50 p-4 text-sm">
    <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 text-emerald-600"/><div><div className="font-semibold">{plantilla.nombre}</div><div className="mt-1 text-[var(--text-secondary)]">{plantilla.cantidadSecciones} secciones · {plantilla.cantidadCaracteristicas} parámetros configurados</div></div></div>
   </div>}
   <div className="flex justify-end">
    <Button disabled={!plantillaId} onClick={()=>nav(`/certificacion/certificados/previsualizar/${id}/${plantillaId}`)}>
     <FileCheck2/>Continuar a previsualización
    </Button>
   </div>
  </CardContent></Card>}
 </PageContainer>;
}

function Info({label,value}:{label:string;value:string}){return <div><div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{label}</div><div className="mt-1 font-medium">{value}</div></div>}
