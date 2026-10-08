import {useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowLeft,CheckCircle2,FileText,Search,ShieldCheck,Star} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {establecerPlantillaPredeterminada,listarPlantillas} from "./api";
import type {PlantillaLista} from "./types";

type Grupo={
 versionFtId:number;
 productoCodigo:string;
 documentoCodigo:string;
 documentoDescripcionDocumento:string;
 versionNumero:number|null;
 plantillas:PlantillaLista[];
};

export default function CertificadoAsignacionPredeterminadaPage(){
 const nav=useNavigate();
 const qc=useQueryClient();
 const [busqueda,setBusqueda]=useState("");

 const q=useQuery({
  queryKey:["certificado-plantillas"],
  queryFn:()=>listarPlantillas()
 });

 const asignar=useMutation({
  mutationFn:(id:number)=>establecerPlantillaPredeterminada(id),
  onSuccess:async()=>{
   await qc.invalidateQueries({queryKey:["certificado-plantillas"]});
   await qc.invalidateQueries({queryKey:["certificado-plantilla-predeterminada"]});
  }
 });

 const grupos=useMemo(()=>{
  const map=new Map<number,Grupo>();

  for(const p of q.data??[]){
   if(!map.has(p.versionFtId)){
    map.set(p.versionFtId,{
     versionFtId:p.versionFtId,
     productoCodigo:p.productoCodigo??"—",
     documentoCodigo:p.documentoCodigo,
     documentoDescripcionDocumento:p.documentoDescripcionDocumento,
     versionNumero:p.versionNumero,
     plantillas:[]
    });
   }
   map.get(p.versionFtId)!.plantillas.push(p);
  }

  const term=busqueda.trim().toLocaleLowerCase();

  return [...map.values()]
   .filter(g=>!term||[
    g.productoCodigo,
    g.documentoCodigo,
    g.documentoDescripcionDocumento,
    ...g.plantillas.map(x=>x.nombre)
   ].some(x=>String(x??"").toLocaleLowerCase().includes(term)))
   .sort((a,b)=>a.productoCodigo.localeCompare(b.productoCodigo,"es",{numeric:true,sensitivity:"base"}));
 },[q.data,busqueda]);

 return <PageContainer className="space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div>
    <Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={()=>nav("/documentos/diseno-certificados")}>
     <ArrowLeft/>Diseño de certificados
    </Button>
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--primary)]">Gestión documental · Certificados</p>
    <h1 className="mt-1 text-2xl font-semibold">Asignación de plantilla predeterminada</h1>
    <p className="mt-1 max-w-3xl text-sm text-[var(--text-secondary)]">
     Define qué modelo utilizará automáticamente el sistema al emitir certificados para cada producto y Ficha Técnica.
    </p>
   </div>
   <div className="rounded-xl border border-[var(--border)] bg-[var(--primary-soft)] px-4 py-3 text-sm text-[var(--primary-strong)]">
    <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4"/>Regla de emisión</div>
    <p className="mt-1 text-xs">Solo una plantilla predeterminada por FT.</p>
   </div>
  </div>

  <Card>
   <CardContent className="p-4">
    <div className="relative">
     <Search className="absolute left-3 top-2.5 size-4 text-slate-400"/>
     <Input
      className="pl-9"
      placeholder="Buscar producto, FT o nombre de plantilla"
      value={busqueda}
      onChange={e=>setBusqueda(e.target.value)}
     />
    </div>
   </CardContent>
  </Card>

  {q.isLoading?<Card><CardContent className="p-10 text-center text-sm">Cargando asignaciones...</CardContent></Card>:
   q.isError?<Card><CardContent className="p-10 text-center text-sm text-red-600">No se pudieron cargar las plantillas.</CardContent></Card>:
   grupos.length===0?<Card><CardContent className="p-12 text-center"><FileText className="mx-auto mb-3 size-8 text-slate-300"/><p className="font-medium">No hay plantillas para mostrar</p></CardContent></Card>:
   <div className="space-y-4">
    {grupos.map(g=>{
     const predeterminada=g.plantillas.find(x=>x.esPredeterminada);

     return <Card key={g.versionFtId} className="overflow-hidden">
      <div className="h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary))]"/>
      <CardContent className="p-0">
       <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-slate-50/70 px-5 py-4">
        <div>
         <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-[var(--text)]">{g.productoCodigo}</h2>
          <Badge variant="outline">{g.documentoCodigo}</Badge>
          <Badge variant="outline">v{g.versionNumero}</Badge>
         </div>
         <p className="mt-1 text-sm text-[var(--text-secondary)]">{g.documentoDescripcionDocumento}</p>
        </div>
        <div className="text-right">
         <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modelo actual</div>
         <div className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-[var(--primary)]">
          <Star className="size-4 fill-[var(--secondary)] text-[var(--secondary)]"/>
          {predeterminada?.nombre??"Sin predeterminada"}
         </div>
        </div>
       </div>

       <div className="divide-y">
        {g.plantillas
         .sort((a,b)=>Number(b.esPredeterminada)-Number(a.esPredeterminada)||a.nombre.localeCompare(b.nombre))
         .map(p=>{
          const activa=p.esPredeterminada;

          return <div key={p.certificadoPlantillaId} className={"flex flex-wrap items-center gap-4 px-5 py-4 "+(activa?"bg-[var(--primary-soft)]/45":"bg-white")}>
           <div className={"flex size-10 shrink-0 items-center justify-center rounded-full border "+(activa?"border-[var(--primary)] bg-[var(--primary)] text-white":"border-slate-200 bg-white text-slate-400")}>
            {activa?<CheckCircle2 className="size-5"/>:<FileText className="size-5"/>}
           </div>

           <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
             <span className="font-semibold">{p.nombre}</span>
             {activa&&<Badge className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]">Predeterminada</Badge>}
            </div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">
             {p.cantidadSecciones} secciones · {p.cantidadCaracteristicas} parámetros configurados
            </div>
           </div>

           <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white" onClick={()=>nav(`/certificacion/certificados/plantillas/${p.certificadoPlantillaId}`)}>
             Ver diseño
            </Button>
            {!activa&&<Button
             size="sm"
             disabled={asignar.isPending}
             onClick={()=>{
              if(window.confirm(`¿Usar "${p.nombre}" como plantilla predeterminada para ${g.productoCodigo}?`))
               asignar.mutate(p.certificadoPlantillaId);
             }}>
             <Star className="size-4"/>Usar por defecto
            </Button>}
           </div>
          </div>;
         })}
       </div>
      </CardContent>
     </Card>;
    })}
   </div>}

  {asignar.isSuccess&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{asignar.data.mensaje}</div>}
  {asignar.isError&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{asignar.error instanceof Error?asignar.error.message:"No se pudo actualizar la plantilla predeterminada."}</div>}
 </PageContainer>;
}
