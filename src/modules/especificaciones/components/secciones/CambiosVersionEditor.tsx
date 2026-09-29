import {useEffect,useMemo,useState} from "react";
import {Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {DetalleEt,GuardarCambioEt,GuardarCambiosEt} from "../../types";
type Props={cambios:DetalleEt["cambios"];editable:boolean;guardando:boolean;onGuardar:(x:GuardarCambiosEt)=>void};
export default function CambiosVersionEditor({cambios,editable,guardando,onGuardar}:Props){
 const inicial=useMemo<GuardarCambioEt[]>(()=>cambios.map(x=>({numeroRevision:x.numeroRevision,fechaActualizacion:(x.fechaActualizacion??"").slice(0,10),descripcion:x.descripcion})),[cambios]);
 const [filas,setFilas]=useState(inicial);useEffect(()=>setFilas(inicial),[inicial]);
 const set=<K extends keyof GuardarCambioEt>(i:number,k:K,v:GuardarCambioEt[K])=>setFilas(x=>x.map((a,j)=>j===i?{...a,[k]:v}:a));
 const invalid=filas.some(x=>x.numeroRevision<=0||!x.fechaActualizacion||!x.descripcion.trim()||x.descripcion.length>1000)||new Set(filas.map(x=>x.numeroRevision)).size!==filas.length;
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Cambios de esta versión</h2><p className="text-xs text-[var(--text-secondary)]">Registre la revisión, fecha y descripción de los cambios documentales.</p></div><Button disabled={!editable} onClick={()=>setFilas(x=>[...x,{numeroRevision:1,fechaActualizacion:new Date().toISOString().slice(0,10),descripcion:""}])}><Plus/>Agregar cambio</Button></div>
  <div className="space-y-3 p-5">{filas.length===0?<div className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin cambios registrados.</div>:filas.map((x,i)=><div key={i} className="grid grid-cols-[110px_160px_minmax(0,1fr)_40px] gap-3 rounded-lg border p-3"><div><label className="mb-1 block text-xs font-medium">Revisión</label><input type="number" min={1} className="h-10 w-full rounded-md border px-3 text-sm" disabled={!editable} value={x.numeroRevision} onChange={e=>set(i,"numeroRevision",Number(e.target.value))}/></div><div><label className="mb-1 block text-xs font-medium">Fecha</label><input type="date" className="h-10 w-full rounded-md border px-3 text-sm" disabled={!editable} value={x.fechaActualizacion} onChange={e=>set(i,"fechaActualizacion",e.target.value)}/></div><div><label className="mb-1 block text-xs font-medium">Descripción del cambio</label><textarea maxLength={1000} className="min-h-20 w-full resize-y rounded-md border px-3 py-2 text-sm" disabled={!editable} value={x.descripcion} onChange={e=>set(i,"descripcion",e.target.value)}/></div><div className="pt-6"><Button size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>setFilas(v=>v.filter((_,j)=>j!==i))}><Trash2/></Button></div></div>)}</div>
  {invalid&&<div className="mx-5 mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Complete revisión, fecha y descripción. La revisión no puede repetirse.</div>}
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||invalid} onClick={()=>onGuardar({cambios:filas.map(x=>({...x,descripcion:x.descripcion.trim()}))})}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
