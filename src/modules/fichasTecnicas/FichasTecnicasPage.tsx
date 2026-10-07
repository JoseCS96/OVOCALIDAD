import {useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {CheckCircle2,Eye,FilePlus2,MoreVertical,Pencil,Search,Send,Trash2,Upload,XCircle} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {cambiarEstadoFt,eliminarFtBorrador,listarFt} from "./api";

export default function FichasTecnicasPage(){
 const nav=useNavigate(),qc=useQueryClient(),[busqueda,setBusqueda]=useState(""),[menu,setMenu]=useState<number|null>(null);
 const q=useQuery({queryKey:["fichas-tecnicas",busqueda],queryFn:()=>listarFt(busqueda)});

 const eliminar=useMutation({
  mutationFn:eliminarFtBorrador,
  onSuccess:()=>qc.invalidateQueries({queryKey:["fichas-tecnicas"]})
 });

 const flujo=useMutation({
  mutationFn:({versionId,accion,comentario}:{versionId:number;accion:"ENVIAR_REVISION"|"OBSERVAR"|"VERIFICAR"|"PUBLICAR"|"VIGENTAR"|"RETORNAR_BORRADOR";comentario?:string|null}) =>
   cambiarEstadoFt(versionId,{accion,comentario:comentario??null}),
  onSuccess:async()=>{
   setMenu(null);
   await qc.invalidateQueries({queryKey:["fichas-tecnicas"]});
  }
 });

 const confirmarEliminar=(versionId:number,codigo:string,version:number|null)=>{
  const ok=window.confirm(`¿Eliminar la versión ${version??""} de ${codigo}?\n\nEsta opción está habilitada temporalmente para limpieza de datos de prueba. No se permitirá eliminar una FT que ya tenga certificados emitidos.`);
  if(ok) eliminar.mutate(versionId);
 };

 return <PageContainer className="space-y-5">
  <div className="flex items-start justify-between gap-3">
   <div>
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental</p>
    <h1 className="mt-1 text-2xl font-semibold">Fichas técnicas</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">Define la especificación comunicada al cliente y qué parámetros pueden imprimirse en certificados.</p>
   </div>
   <Button onClick={()=>nav("/documentos/fichas-tecnicas/nueva")}><FilePlus2/>Nueva ficha técnica</Button>
  </div>

  <Card><CardContent className="p-4">
   <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]"/><Input className="pl-9" placeholder="Buscar por producto, código o descripción" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div>
  </CardContent></Card>

  {eliminar.isError&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{eliminar.error instanceof Error?eliminar.error.message:"No se pudo eliminar la ficha técnica."}</div>}

  <Card><CardContent className="p-0">
   {q.isLoading?<div className="p-6 text-sm">Cargando...</div>:<div className="overflow-x-auto">
    <table className="w-full text-sm">
     <thead className="border-b bg-slate-50 text-left">
      <tr><th className="p-3">Producto</th><th className="p-3">Ficha técnica</th><th className="p-3">Versión</th><th className="p-3">Estado</th><th className="p-3">Características</th><th className="p-3">Certificables</th><th className="p-3 text-right">Acciones</th></tr>
     </thead>
     <tbody>
      {(q.data??[]).map(x=><tr key={x.versionId} className="border-b last:border-0">
       <td className="p-3 font-semibold">{x.productoCodigo??"—"}</td>
       <td className="p-3"><b>{x.documentoCodigo}</b><div className="text-xs text-[var(--text-secondary)]">{x.documentoDescripcionDocumento}</div></td>
       <td className="p-3">{x.versionNumero}</td>
       <td className="p-3"><span className="rounded-full border px-2 py-1 text-xs font-medium">{x.estadoVersion}</span></td>
       <td className="p-3">{x.cantidadCaracteristicas}</td>
       <td className="p-3 font-semibold">{x.cantidadParametrosCertificables}</td>
       <td className="p-3 text-right">
        <div className="inline-flex items-center gap-1">
         <Button size="sm" variant="outline" onClick={()=>nav(`/documentos/fichas-tecnicas/${x.versionId}/editar`)}>
          {x.estadoVersion==="BORRADOR"?<><Pencil/>Configurar</>:<><Eye/>Ver detalle</>}
         </Button>

         <div className="relative">
          <Button variant="outline" size="icon-sm" aria-label="Más acciones" onClick={()=>setMenu(menu===x.versionId?null:x.versionId)}>
           <MoreVertical/>
          </Button>

          {menu===x.versionId&&<div className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-lg border bg-white py-1 text-left shadow-lg">
           {x.estadoVersion==="BORRADOR"&&<>
            <button type="button" disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Enviar esta Ficha Técnica a revisión?"))flujo.mutate({versionId:x.versionId,accion:"ENVIAR_REVISION"})}} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
             <Send className="size-4"/>Enviar a revisión
            </button>

           </>}

           {x.estadoVersion==="PENDIENTE_REVISION"&&<>
            <button type="button" disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Verificar esta Ficha Técnica?"))flujo.mutate({versionId:x.versionId,accion:"VERIFICAR"})}} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
             <CheckCircle2 className="size-4"/>Verificar
            </button>
            <button type="button" disabled={flujo.isPending} onClick={()=>{const comentario=window.prompt("Motivo de la observación:");if(comentario?.trim())flujo.mutate({versionId:x.versionId,accion:"OBSERVAR",comentario:comentario.trim()})}} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50">
             <XCircle className="size-4"/>Observar
            </button>
           </>}

           {x.estadoVersion==="VERIFICADO"&&<>
            <button type="button" disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Publicar esta Ficha Técnica? Todavía no quedará vigente."))flujo.mutate({versionId:x.versionId,accion:"PUBLICAR"})}} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
             <Upload className="size-4"/>Publicar FT
            </button>
            <button type="button" disabled={flujo.isPending} onClick={()=>{const comentario=window.prompt("Motivo de la observación:");if(comentario?.trim())flujo.mutate({versionId:x.versionId,accion:"OBSERVAR",comentario:comentario.trim()})}} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50">
             <XCircle className="size-4"/>Observar
            </button>
           </>}

           {x.estadoVersion==="PUBLICADO"&&
            <button type="button" disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Pasar esta Ficha Técnica a VIGENTE?"))flujo.mutate({versionId:x.versionId,accion:"VIGENTAR"})}} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
             <CheckCircle2 className="size-4"/>Pasar a vigente
            </button>
           }

           {x.estadoVersion==="VIGENTE"&&
            <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">Sin acciones de workflow</div>
           }

           <button type="button" disabled={flujo.isPending} onClick={()=>{if(x.estadoVersion==="BORRADOR"){window.alert("La Ficha Técnica ya se encuentra en BORRADOR.");setMenu(null);return}if(window.confirm("¿Enviar esta Ficha Técnica nuevamente a BORRADOR? Esta opción está habilitada temporalmente para pruebas."))flujo.mutate({versionId:x.versionId,accion:"RETORNAR_BORRADOR"})}} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50">
            <XCircle className="size-4"/>Enviar a borrador (pruebas)
           </button>

           <button type="button" disabled={eliminar.isPending||flujo.isPending} onClick={()=>{setMenu(null);confirmarEliminar(x.versionId,x.documentoCodigo,x.versionNumero)}} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
            <Trash2 className="size-4"/>Eliminar FT (pruebas)
           </button>
          </div>}
         </div>
        </div>
       </td>
      </tr>)}
      {!q.data?.length&&<tr><td colSpan={7} className="p-8 text-center text-[var(--text-secondary)]">No se encontraron fichas técnicas.</td></tr>}
     </tbody>
    </table>
   </div>}
  </CardContent></Card>
 </PageContainer>
}
