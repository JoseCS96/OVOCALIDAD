import {useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {CheckCircle2,Eye,FilePlus2,MoreVertical,Pencil,Search,Send,Trash2,Upload,XCircle} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {cambiarEstadoFt,eliminarFtBorrador,listarFt} from "./api";

export default function FichasTecnicasPage(){
 const nav=useNavigate(),qc=useQueryClient(),[busqueda,setBusqueda]=useState("");
 const q=useQuery({queryKey:["fichas-tecnicas",busqueda],queryFn:()=>listarFt(busqueda)});

 const eliminar=useMutation({
  mutationFn:eliminarFtBorrador,
  onSuccess:()=>qc.invalidateQueries({queryKey:["fichas-tecnicas"]})
 });

 const flujo=useMutation({
  mutationFn:({versionId,accion,comentario}:{versionId:number;accion:"ENVIAR_REVISION"|"OBSERVAR"|"VERIFICAR"|"PUBLICAR"|"VIGENTAR"|"RETORNAR_BORRADOR";comentario?:string|null}) =>
   cambiarEstadoFt(versionId,{accion,comentario:comentario??null}),
  onSuccess:async()=>{
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

         <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="Más acciones"><MoreVertical/></Button>} />
          <DropdownMenuContent align="end" className="w-64">

           {x.estadoVersion==="BORRADOR"&&<>
            <DropdownMenuItem disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Enviar esta Ficha Técnica a revisión?"))flujo.mutate({versionId:x.versionId,accion:"ENVIAR_REVISION"})}} className="gap-2">
             <Send className="size-4"/>Enviar a revisión
            </DropdownMenuItem>

           </>}

           {x.estadoVersion==="PENDIENTE_REVISION"&&<>
            <DropdownMenuItem disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Verificar esta Ficha Técnica?"))flujo.mutate({versionId:x.versionId,accion:"VERIFICAR"})}} className="gap-2">
             <CheckCircle2 className="size-4"/>Verificar
            </DropdownMenuItem>
            <DropdownMenuItem disabled={flujo.isPending} onClick={()=>{const comentario=window.prompt("Motivo de la observación:");if(comentario?.trim())flujo.mutate({versionId:x.versionId,accion:"OBSERVAR",comentario:comentario.trim()})}} className="gap-2 text-amber-700">
             <XCircle className="size-4"/>Observar
            </DropdownMenuItem>
           </>}

           {x.estadoVersion==="VERIFICADO"&&<>
            <DropdownMenuItem disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Publicar esta Ficha Técnica? Todavía no quedará vigente."))flujo.mutate({versionId:x.versionId,accion:"PUBLICAR"})}} className="gap-2">
             <Upload className="size-4"/>Publicar FT
            </DropdownMenuItem>
            <DropdownMenuItem disabled={flujo.isPending} onClick={()=>{const comentario=window.prompt("Motivo de la observación:");if(comentario?.trim())flujo.mutate({versionId:x.versionId,accion:"OBSERVAR",comentario:comentario.trim()})}} className="gap-2 text-amber-700">
             <XCircle className="size-4"/>Observar
            </DropdownMenuItem>
           </>}

           {x.estadoVersion==="PUBLICADO"&&
            <DropdownMenuItem disabled={flujo.isPending} onClick={()=>{if(window.confirm("¿Pasar esta Ficha Técnica a VIGENTE?"))flujo.mutate({versionId:x.versionId,accion:"VIGENTAR"})}} className="gap-2">
             <CheckCircle2 className="size-4"/>Pasar a vigente
            </DropdownMenuItem>
           }

           {x.estadoVersion==="VIGENTE"&&
            <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">Sin acciones de workflow</div>
           }

           <DropdownMenuItem disabled={flujo.isPending} onClick={()=>{if(x.estadoVersion==="BORRADOR"){window.alert("La Ficha Técnica ya se encuentra en BORRADOR.");return}if(window.confirm("¿Enviar esta Ficha Técnica nuevamente a BORRADOR? Esta opción está habilitada temporalmente para pruebas."))flujo.mutate({versionId:x.versionId,accion:"RETORNAR_BORRADOR"})}} className="gap-2 text-amber-700">
            <XCircle className="size-4"/>Enviar a borrador (pruebas)
           </DropdownMenuItem>

           <DropdownMenuItem disabled={eliminar.isPending||flujo.isPending} onClick={()=>{confirmarEliminar(x.versionId,x.documentoCodigo,x.versionNumero)}} className="gap-2 text-red-600">
            <Trash2 className="size-4"/>Eliminar FT (pruebas)
           </DropdownMenuItem>

          </DropdownMenuContent>
         </DropdownMenu>
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
