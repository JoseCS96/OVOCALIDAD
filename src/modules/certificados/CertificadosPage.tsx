import {useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {FilePlus2,LayoutTemplate,Pencil,Search,Star,Trash2} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {crearPlantilla,eliminarPlantilla,listarFichasTecnicasCertificado,listarPlantillas} from "./api";

export default function CertificadosPage(){
 const nav=useNavigate(),qc=useQueryClient();
 const q=useQuery({queryKey:["certificado-plantillas"],queryFn:()=>listarPlantillas()});

 const [busquedaFt,setBusquedaFt]=useState("");
 const [versionFtId,setVersionFtId]=useState<number|null>(null);
 const [nombre,setNombre]=useState("");

 const ft=useQuery({
  queryKey:["fichas-tecnicas-certificado",busquedaFt],
  queryFn:()=>listarFichasTecnicasCertificado(busquedaFt),
 });

 const seleccionada=ft.data?.find(x=>x.versionId===versionFtId)??null;

 const crear=useMutation({
  mutationFn:()=>crearPlantilla({versionFtId:versionFtId!,nombre:nombre.trim(),descripcion:null}),
  onSuccess:r=>{
   qc.invalidateQueries({queryKey:["certificado-plantillas"]});
   nav(`/certificacion/certificados/plantillas/${r.certificadoPlantillaId}`);
  },
 });

 const eliminar=useMutation({
  mutationFn:eliminarPlantilla,
  onSuccess:()=>qc.invalidateQueries({queryKey:["certificado-plantillas"]}),
 });

 return <PageContainer className="space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div>
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--primary)]">Gestión documental · Certificados</p>
    <h1 className="mt-1 text-2xl font-semibold">Diseño de certificados</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">Crea y administra los modelos de certificado asociados a cada Ficha Técnica.</p>
   </div>
   <Button variant="outline" className="bg-white" onClick={()=>nav("/documentos/diseno-certificados/asignacion")}>
    <Star className="size-4"/>Asignación predeterminada
   </Button>
  </div>

  <Card className="overflow-hidden">
   <div className="h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary))]"/>
   <CardContent className="space-y-4 p-5">
    <div>
     <h2 className="font-semibold">Nueva plantilla</h2>
     <p className="text-sm text-[var(--text-secondary)]">Selecciona una Ficha Técnica vigente con parámetros habilitados para certificado.</p>
    </div>

    <div className="relative">
     <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]"/>
     <Input className="pl-9" placeholder="Buscar por producto, código o descripción de FT" value={busquedaFt} onChange={e=>{setBusquedaFt(e.target.value);setVersionFtId(null)}}/>
    </div>

    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.8fr)_auto]">
     <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={versionFtId??""} onChange={e=>setVersionFtId(e.target.value?Number(e.target.value):null)} disabled={ft.isLoading}>
      <option value="">{ft.isLoading?"Cargando fichas técnicas...":"Seleccionar Ficha Técnica"}</option>
      {ft.data?.map(x=><option key={x.versionId} value={x.versionId}>{x.productoCodigo??"Sin producto"} — {x.documentoCodigo} · v{x.versionNumero} · {x.cantidadParametrosCertificables} parámetros</option>)}
     </select>
     <Input placeholder="Nombre de plantilla, ej. Certificado Fisicoquímico" value={nombre} onChange={e=>setNombre(e.target.value)}/>
     <Button disabled={!versionFtId||!nombre.trim()||crear.isPending} onClick={()=>crear.mutate()}><FilePlus2/>{crear.isPending?"Creando...":"Crear plantilla"}</Button>
    </div>

    {seleccionada&&<div className="rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/40 p-4 text-sm">
     <div className="font-semibold">{seleccionada.productoCodigo??"—"} — {seleccionada.documentoDescripcionDocumento}</div>
     <div className="mt-1 text-[var(--text-secondary)]">{seleccionada.documentoCodigo} · Versión {seleccionada.versionNumero} · {seleccionada.estadoVersion}</div>
     <div className="mt-2 font-medium">{seleccionada.cantidadParametrosCertificables} parámetros certificables disponibles según FT</div>
    </div>}

    {ft.isError&&<p className="text-sm text-red-600">No se pudieron cargar las Fichas Técnicas disponibles.</p>}
    {crear.isError&&<p className="text-sm text-red-600">{crear.error instanceof Error?crear.error.message:"No se pudo crear."}</p>}
   </CardContent>
  </Card>

  <Card>
   <CardContent className="p-0">
    {q.isLoading?<div className="p-6 text-sm">Cargando plantillas...</div>:
    !q.data?.length?<div className="p-10 text-center"><LayoutTemplate className="mx-auto mb-3 opacity-40"/><p className="font-medium">Aún no hay plantillas de certificado</p><p className="text-sm text-[var(--text-secondary)]">Crea la primera a partir de una versión de Ficha Técnica.</p></div>:
    <div className="overflow-x-auto">
     <table className="w-full text-sm">
      <thead className="border-b bg-[var(--primary-soft)]/55 text-left text-[var(--primary-strong)]">
       <tr><th className="p-3">Plantilla</th><th className="p-3">Producto / FT</th><th className="p-3">Diseño</th><th className="p-3 text-right">Acciones</th></tr>
      </thead>
      <tbody>{q.data.map(x=><tr key={x.certificadoPlantillaId} className="border-b last:border-0">
       <td className="p-3">
        <div className="flex flex-wrap items-center gap-2">
         <b>{x.nombre}</b>
         {x.esPredeterminada&&<Badge className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]"><Star className="mr-1 size-3 fill-[var(--secondary)] text-[var(--secondary)]"/>Predeterminada</Badge>}
        </div>
        <div className="text-xs text-[var(--text-secondary)]">{x.descripcion}</div>
       </td>
       <td className="p-3"><b>{x.productoCodigo??"—"}</b><div className="text-xs">{x.documentoCodigo} · v{x.versionNumero}</div></td>
       <td className="p-3">{x.cantidadSecciones} secciones · {x.cantidadCaracteristicas} parámetros</td>
       <td className="p-3"><div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" className="bg-white" onClick={()=>nav(`/certificacion/certificados/plantillas/${x.certificadoPlantillaId}`)}><Pencil/>Diseñar</Button>
        <Button size="sm" variant="outline" className="bg-white" onClick={()=>{if(confirm("¿Desactivar esta plantilla?"))eliminar.mutate(x.certificadoPlantillaId)}}><Trash2/></Button>
       </div></td>
      </tr>)}</tbody>
     </table>
    </div>}
   </CardContent>
  </Card>
 </PageContainer>;
}
