import {useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {FilePlus2,LayoutTemplate,Pencil,Trash2} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {crearPlantilla,eliminarPlantilla,listarPlantillas} from "./api";

export default function CertificadosPage(){
 const nav=useNavigate(),qc=useQueryClient(),q=useQuery({queryKey:["certificado-plantillas"],queryFn:listarPlantillas});
 const [version,setVersion]=useState(""),[nombre,setNombre]=useState("");
 const crear=useMutation({mutationFn:()=>crearPlantilla({versionFtId:Number(version),nombre:nombre.trim(),descripcion:null}),onSuccess:r=>{qc.invalidateQueries({queryKey:["certificado-plantillas"]});nav(`/certificacion/certificados/plantillas/${r.certificadoPlantillaId}`)}});
 const eliminar=useMutation({mutationFn:eliminarPlantilla,onSuccess:()=>qc.invalidateQueries({queryKey:["certificado-plantillas"]})});
 return <PageContainer className="space-y-5">
  <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Certificación</p><h1 className="mt-1 text-2xl font-semibold">Diseño de certificados</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">La Ficha Técnica define los parámetros certificables; la plantilla define cómo se presentan.</p></div>
  <Card><CardContent className="p-5"><div className="grid gap-3 md:grid-cols-[180px_1fr_auto]"><Input type="number" min="1" placeholder="VersionId de la FT" value={version} onChange={e=>setVersion(e.target.value)}/><Input placeholder="Nombre de plantilla, ej. Certificado Fisicoquímico" value={nombre} onChange={e=>setNombre(e.target.value)}/><Button disabled={!version||!nombre.trim()||crear.isPending} onClick={()=>crear.mutate()}><FilePlus2/>Crear plantilla</Button></div>{crear.isError&&<p className="mt-3 text-sm text-red-600">{crear.error instanceof Error?crear.error.message:"No se pudo crear."}</p>}</CardContent></Card>
  <Card><CardContent className="p-0">{q.isLoading?<div className="p-6 text-sm">Cargando plantillas...</div>:!q.data?.length?<div className="p-10 text-center"><LayoutTemplate className="mx-auto mb-3 opacity-40"/><p className="font-medium">Aún no hay plantillas de certificado</p><p className="text-sm text-[var(--text-secondary)]">Crea la primera a partir de una versión de Ficha Técnica.</p></div>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-slate-50 text-left"><tr><th className="p-3">Plantilla</th><th className="p-3">Producto / FT</th><th className="p-3">Diseño</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>{q.data.map(x=><tr key={x.certificadoPlantillaId} className="border-b last:border-0"><td className="p-3"><b>{x.nombre}</b><div className="text-xs text-[var(--text-secondary)]">{x.descripcion}</div></td><td className="p-3"><b>{x.productoCodigo??"—"}</b><div className="text-xs">{x.documentoCodigo} · v{x.versionNumero}</div></td><td className="p-3">{x.cantidadSecciones} secciones · {x.cantidadCaracteristicas} parámetros</td><td className="p-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={()=>nav(`/certificacion/certificados/plantillas/${x.certificadoPlantillaId}`)}><Pencil/>Diseñar</Button><Button size="sm" variant="outline" onClick={()=>{if(confirm("¿Desactivar esta plantilla?"))eliminar.mutate(x.certificadoPlantillaId)}}><Trash2/></Button></div></td></tr>)}</tbody></table></div>}</CardContent></Card>
 </PageContainer>
}
