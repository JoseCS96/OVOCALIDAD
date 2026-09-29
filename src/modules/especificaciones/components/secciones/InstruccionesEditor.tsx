import {useEffect,useMemo,useState} from "react";
import {Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {DetalleEt,GuardarInstruccionEt,GuardarInstruccionesEt} from "../../types";

type Props={instrucciones:DetalleEt["instrucciones"];editable:boolean;guardando:boolean;onGuardar:(x:GuardarInstruccionesEt)=>void};
export default function InstruccionesEditor({instrucciones,editable,guardando,onGuardar}:Props){
 const inicial=useMemo<GuardarInstruccionEt[]>(()=>[...instrucciones].sort((a,b)=>(a.orden??0)-(b.orden??0)).map((x,i)=>({descripcion:x.instruccionDescripcion,orden:x.orden??i+1})),[instrucciones]);
 const [filas,setFilas]=useState(inicial);useEffect(()=>setFilas(inicial),[inicial]);
 const cambiar=(i:number,descripcion:string)=>setFilas(x=>x.map((a,j)=>j===i?{...a,descripcion}:a));
 const eliminar=(i:number)=>setFilas(x=>x.filter((_,j)=>j!==i).map((a,j)=>({...a,orden:j+1})));
 const invalid=filas.some(x=>!x.descripcion.trim()||x.descripcion.length>2000);
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Instrucciones</h2><p className="text-xs text-[var(--text-secondary)]">{filas.length} instrucciones en esta versión.</p></div><Button disabled={!editable} onClick={()=>setFilas(x=>[...x,{descripcion:"",orden:x.length+1}])}><Plus/>Agregar instrucción</Button></div>
  <div className="space-y-3 p-5">{filas.length===0?<div className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin instrucciones registradas.</div>:filas.map((x,i)=><div key={i} className="grid grid-cols-[42px_minmax(0,1fr)_40px] gap-3 rounded-lg border p-3"><div className="flex h-9 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold">{i+1}</div><div><textarea className="min-h-20 w-full resize-y rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200" maxLength={2000} disabled={!editable} value={x.descripcion} onChange={e=>cambiar(i,e.target.value)} placeholder="Ingrese la instrucción..."/><div className="mt-1 text-right text-xs text-[var(--text-secondary)]">{x.descripcion.length}/2000</div></div><Button size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>eliminar(i)}><Trash2/></Button></div>)}</div>
  {invalid&&<div className="mx-5 mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Todas las instrucciones deben tener contenido.</div>}
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||invalid} onClick={()=>onGuardar({instrucciones:filas.map((x,i)=>({...x,descripcion:x.descripcion.trim(),orden:i+1}))})}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
