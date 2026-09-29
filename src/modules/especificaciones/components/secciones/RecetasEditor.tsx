import {useEffect,useMemo,useState} from "react";
import {Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import type {GuardarRecetaEt,GuardarRecetasEt,RecetaEt,TipoContenidoCatalogoEt} from "../../types";

type Props={recetas:RecetaEt[];tiposContenido:TipoContenidoCatalogoEt[];editable:boolean;guardando:boolean;onGuardar:(x:GuardarRecetasEt)=>void};
const nueva=(orden:number):GuardarRecetaEt=>({descripcion:"",idTipoContenido:3,orden});
export default function RecetasEditor({recetas,tiposContenido,editable,guardando,onGuardar}:Props){
 const inicial=useMemo(()=>[...recetas].sort((a,b)=>(a.orden??0)-(b.orden??0)).map((x,i)=>({descripcion:x.recetaDescripcion,idTipoContenido:x.idTipoContenido,orden:x.orden??i+1})),[recetas]);
 const [filas,setFilas]=useState<GuardarRecetaEt[]>(inicial);
 useEffect(()=>setFilas(inicial),[inicial]);
 const actualizar=(i:number,p:Partial<GuardarRecetaEt>)=>setFilas(xs=>xs.map((x,j)=>j===i?{...x,...p}:x));
 const quitar=(i:number)=>setFilas(xs=>xs.filter((_,j)=>j!==i).map((x,j)=>({...x,orden:j+1})));
 const incompletas=filas.some(x=>!x.descripcion.trim()||x.orden<=0);
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Recetas</h2><p className="text-xs text-[var(--text-secondary)]">Estructura el contenido como título, subtítulo o detalle y conserva su orden.</p></div><Button type="button" disabled={!editable} onClick={()=>setFilas(xs=>[...xs,nueva(xs.length+1)])}><Plus/>Agregar contenido</Button></div>
  <div className="space-y-3 p-5">{filas.length===0?<div className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin recetas registradas.</div>:filas.map((x,i)=><div key={i} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[160px_minmax(0,1fr)_90px_40px]">
   <select className="h-9 rounded-md border bg-white px-2 text-sm" disabled={!editable} value={x.idTipoContenido??""} onChange={e=>actualizar(i,{idTipoContenido:e.target.value?Number(e.target.value):null})}><option value="">Sin tipo</option>{tiposContenido.map(t=><option key={t.idTipoContenido} value={t.idTipoContenido}>{t.nombre}</option>)}</select>
   <textarea className="min-h-20 w-full resize-y rounded-md border bg-white px-3 py-2 text-sm" maxLength={2000} disabled={!editable} value={x.descripcion} onChange={e=>actualizar(i,{descripcion:e.target.value})} placeholder="Ingrese el contenido de la receta..."/>
   <Input type="number" min={1} disabled={!editable} value={x.orden} onChange={e=>actualizar(i,{orden:Number(e.target.value)})}/>
   <Button type="button" size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>quitar(i)}><Trash2/></Button>
  </div>)}</div>
  {incompletas&&<div className="mx-5 mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Complete el contenido y orden de cada fila.</div>}
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||incompletas} onClick={()=>onGuardar({recetas:filas})}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
