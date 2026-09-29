import {useEffect,useMemo,useState} from "react";
import {Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {ContenidoRotuladoCatalogo,DetalleEt,GuardarContenidoRotuladoEt} from "../../types";

type Props={contenido:DetalleEt["contenidoRotulado"];catalogo?:ContenidoRotuladoCatalogo[];editable:boolean;guardando:boolean;onGuardar:(x:GuardarContenidoRotuladoEt)=>void};
type Fila={contRotuladoId:number;orden:number};
export default function ContenidoRotuladoEditor({contenido,catalogo=[],editable,guardando,onGuardar}:Props){
 const inicial=useMemo<Fila[]>(()=>[...contenido].sort((a,b)=>(a.orden??0)-(b.orden??0)).map((x,i)=>({contRotuladoId:x.contRotuladoId,orden:x.orden??i+1})),[contenido]);
 const [filas,setFilas]=useState(inicial);useEffect(()=>setFilas(inicial),[inicial]);
 const usados=new Set(filas.map(x=>x.contRotuladoId));
 const disponibles=catalogo.filter(x=>!usados.has(x.contRotuladoId));
 const agregar=()=>{const x=disponibles[0];if(x)setFilas(v=>[...v,{contRotuladoId:x.contRotuladoId,orden:v.length+1}])};
 const eliminar=(i:number)=>setFilas(v=>v.filter((_,j)=>j!==i).map((x,j)=>({...x,orden:j+1})));
 const cambiar=(i:number,id:number)=>setFilas(v=>v.map((x,j)=>j===i?{...x,contRotuladoId:id}:x));
 const invalid=filas.some(x=>!x.contRotuladoId)||new Set(filas.map(x=>x.contRotuladoId)).size!==filas.length;
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Contenido del rotulado</h2><p className="text-xs text-[var(--text-secondary)]">Seleccione los datos que deben declararse en el rotulado.</p></div><Button disabled={!editable||disponibles.length===0} onClick={agregar}><Plus/>Agregar contenido</Button></div>
  <div className="space-y-3 p-5">{filas.length===0?<div className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin contenido de rotulado registrado.</div>:filas.map((x,i)=><div key={i} className="grid grid-cols-[42px_minmax(0,1fr)_40px] items-center gap-3 rounded-lg border p-3"><div className="flex h-9 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold">{i+1}</div><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" disabled={!editable} value={x.contRotuladoId} onChange={e=>cambiar(i,Number(e.target.value))}>{catalogo.filter(c=>c.contRotuladoId===x.contRotuladoId||!usados.has(c.contRotuladoId)).map(c=><option key={c.contRotuladoId} value={c.contRotuladoId}>{c.contRotuladoDescripcion}</option>)}</select><Button size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>eliminar(i)}><Trash2/></Button></div>)}</div>
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||invalid} onClick={()=>onGuardar({contenidoRotulado:filas.map((x,i)=>({...x,orden:i+1}))})}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
