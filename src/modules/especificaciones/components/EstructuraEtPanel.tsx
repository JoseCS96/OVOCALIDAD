import {ArrowDown,ArrowUp,GripVertical,Plus,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {SeccionEt} from "../types";

type Props={estructura:SeccionEt[];activa?:SeccionEt;editable:boolean;busy:boolean;onSeleccionar:(id:number)=>void;onAgregar:()=>void;onMover:(idx:number,dir:-1|1)=>void;onQuitar:(s:SeccionEt)=>void};
export default function EstructuraEtPanel({estructura,activa,editable,busy,onSeleccionar,onAgregar,onMover,onQuitar}:Props){
 return <Card><CardContent className="p-0"><div className="border-b px-4 py-4"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Estructura</h2><p className="text-xs text-[var(--text-secondary)]">{estructura.length} secciones</p></div><Button size="sm" variant="outline" disabled={!editable||busy} onClick={onAgregar}><Plus/>Agregar</Button></div></div>
  <div className="p-2">{estructura.map((s,i)=><div key={s.versSeccId} className={`mb-1 flex items-center gap-1 rounded-lg border ${activa?.versSeccId===s.versSeccId?"border-slate-400 bg-slate-50":"border-transparent"}`}>
   <button className="flex min-w-0 flex-1 items-center gap-2 px-2 py-3 text-left" onClick={()=>onSeleccionar(s.versSeccId)}><GripVertical className="size-4 shrink-0 text-slate-400"/><span className="w-6 text-xs font-semibold text-slate-400">{String(i+1).padStart(2,"0")}</span><span className="truncate text-sm font-medium">{s.seccionDescripcion}</span></button>
   {editable&&s.permiteReordenar&&<div className="mr-1 flex"><Button variant="ghost" size="icon-sm" disabled={busy||i<=1} onClick={()=>onMover(i,-1)}><ArrowUp/></Button><Button variant="ghost" size="icon-sm" disabled={busy||i===estructura.length-1} onClick={()=>onMover(i,1)}><ArrowDown/></Button></div>}
   {editable&&s.seccionId!==11&&<Button className="mr-1" variant="ghost" size="icon-sm" disabled={busy} title="Quitar sección" onClick={()=>onQuitar(s)}><X/></Button>}
  </div>)}</div>
 </CardContent></Card>
}