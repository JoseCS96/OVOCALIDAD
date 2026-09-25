import {useState} from "react";
import {CheckCircle2,ChevronDown,Eye,Send,Upload,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {AccionWorkflowEt,InformacionGeneralEt} from "../types";

type Props={info:InformacionGeneralEt;busy:boolean;onAccion:(accion:AccionWorkflowEt,comentario:string|null)=>void};

export default function EtWorkflowActions({info,busy,onAccion}:Props){
 const [abierto,setAbierto]=useState(false);
 const [accion,setAccion]=useState<AccionWorkflowEt|null>(null);
 const [comentario,setComentario]=useState("");
 const estado=info.estadoVersion?.toUpperCase();
 const habilitado=(a:AccionWorkflowEt)=>{
  if(a==="ENVIAR_REVISION")return estado==="BORRADOR";
  if(a==="OBSERVAR")return estado==="PENDIENTE_REVISION"||estado==="VERIFICADO";
  if(a==="VERIFICAR")return estado==="PENDIENTE_REVISION";
  if(a==="PUBLICAR")return estado==="VERIFICADO";
  return false;
 };
 const seleccionar=(a:AccionWorkflowEt)=>{if(!habilitado(a)||busy)return;setAbierto(false);setComentario("");setAccion(a)};
 const confirmar=()=>{if(!accion)return;if(accion==="OBSERVAR"&&!comentario.trim())return;onAccion(accion,accion==="OBSERVAR"?comentario.trim():null);setAccion(null);setComentario("")};
 const titulo=accion==="ENVIAR_REVISION"?"Enviar a revisión":accion==="OBSERVAR"?"Observar ET":accion==="VERIFICAR"?"Confirmar ET verificada":"Publicar ET";
 const detalle=accion==="ENVIAR_REVISION"?"La ET pasará a PENDIENTE_REVISION y quedará bloqueada para edición.":accion==="OBSERVAR"?(estado==="VERIFICADO"?"La ET volverá a PENDIENTE_REVISION.":"La ET volverá a BORRADOR para su corrección."):accion==="VERIFICAR"?"Confirma que la revisión terminó. La ET pasará a VERIFICADO.":accion==="PUBLICAR"?"La ET debe estar verificada. Al publicar quedará en estado final.":"";
 return <>
  <div className="relative">
   <Button variant="outline" className="h-11 px-4 font-semibold" disabled={busy||estado==="PUBLICADO"} onClick={()=>setAbierto(v=>!v)}>Acciones<ChevronDown className="size-4"/></Button>
   {abierto&&<div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border bg-white p-2 shadow-xl">
    <Opcion icon={<Send className="size-4"/>} texto="Enviar a revisión" disabled={!habilitado("ENVIAR_REVISION")} onClick={()=>seleccionar("ENVIAR_REVISION")}/>
    <Opcion icon={<Eye className="size-4"/>} texto="Observar" disabled={!habilitado("OBSERVAR")} onClick={()=>seleccionar("OBSERVAR")}/>
    <Opcion icon={<CheckCircle2 className="size-4"/>} texto="ET verificada" disabled={!habilitado("VERIFICAR")} onClick={()=>seleccionar("VERIFICAR")}/>
    <Opcion icon={<Upload className="size-4"/>} texto="Publicar ET" disabled={!habilitado("PUBLICAR")} onClick={()=>seleccionar("PUBLICAR")}/>
   </div>}
  </div>
  {accion&&<div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
   <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
    <div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-semibold">{titulo}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{detalle}</p></div><Button variant="ghost" size="icon" onClick={()=>setAccion(null)}><X/></Button></div>
    {accion==="OBSERVAR"&&<div className="mt-5"><label className="text-sm font-medium">Motivo de la observación <span className="text-red-600">*</span></label><textarea autoFocus className="mt-2 min-h-28 w-full resize-y rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200" value={comentario} onChange={e=>setComentario(e.target.value)} placeholder="Indique qué debe corregirse antes de continuar..."/></div>}
    <div className="mt-6 flex justify-end gap-2 border-t pt-4"><Button variant="outline" disabled={busy} onClick={()=>setAccion(null)}>Cancelar</Button><Button disabled={busy||(accion==="OBSERVAR"&&!comentario.trim())} onClick={confirmar}>{busy?"Procesando...":titulo}</Button></div>
   </div>
  </div>}
 </>;
}
function Opcion({icon,texto,disabled,onClick}:{icon:React.ReactNode;texto:string;disabled:boolean;onClick:()=>void}){
 return <button type="button" disabled={disabled} onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35">{icon}<span>{texto}</span></button>
}
