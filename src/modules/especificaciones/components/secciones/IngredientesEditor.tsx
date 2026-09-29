import {useEffect,useMemo,useState} from "react";
import {Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import type {CatalogosIngredientesEt,GuardarIngredienteEt,GuardarIngredientesEt,IngredienteEt} from "../../types";

type Props={ingredientes:IngredienteEt[];catalogos?:CatalogosIngredientesEt;editable:boolean;guardando:boolean;onGuardar:(x:GuardarIngredientesEt)=>void};
const nueva=(orden:number):GuardarIngredienteEt=>({ingredienteId:0,valor:null,idTipoContenido:3,orden});
export default function IngredientesEditor({ingredientes,catalogos,editable,guardando,onGuardar}:Props){
 const inicial=useMemo(()=>[...ingredientes].sort((a,b)=>(a.orden??0)-(b.orden??0)).map((x,i)=>({ingredienteId:x.ingredienteId,valor:x.versIngrValor,idTipoContenido:x.idTipoContenido,orden:x.orden??i+1})),[ingredientes]);
 const [filas,setFilas]=useState<GuardarIngredienteEt[]>(inicial);
 useEffect(()=>setFilas(inicial),[inicial]);
 const maestro=catalogos?.ingredientes??[],tipos=catalogos?.tiposContenido??[];
 const actualizar=(i:number,p:Partial<GuardarIngredienteEt>)=>setFilas(xs=>xs.map((x,j)=>j===i?{...x,...p}:x));
 const quitar=(i:number)=>setFilas(xs=>xs.filter((_,j)=>j!==i).map((x,j)=>({...x,orden:j+1})));
 const agregar=()=>setFilas(xs=>[...xs,nueva(xs.length+1)]);
 const repetidos=filas.some((x,i)=>x.ingredienteId>0&&filas.findIndex(y=>y.ingredienteId===x.ingredienteId)!==i);
 const incompletos=filas.some(x=>!x.ingredienteId||!x.orden);
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Ingredientes</h2><p className="text-xs text-[var(--text-secondary)]">Ingredientes y composición asociados a esta versión.</p></div><Button type="button" disabled={!editable} onClick={agregar}><Plus/>Agregar ingrediente</Button></div>
  <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Ingrediente</th><th>Unidad</th><th>Valor</th><th>Tipo contenido</th><th className="w-24">Orden</th><th className="px-5 text-right">Acciones</th></tr></thead>
   <tbody>{filas.length===0?<tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--text-secondary)]">Sin ingredientes registrados.</td></tr>:filas.map((x,i)=>{const m=maestro.find(z=>z.ingredienteId===x.ingredienteId);return <tr key={i} className="border-t">
    <td className="px-5 py-3"><select className="h-9 w-full min-w-64 rounded-md border bg-white px-2" disabled={!editable} value={x.ingredienteId} onChange={e=>actualizar(i,{ingredienteId:Number(e.target.value)})}><option value={0}>Seleccione...</option>{maestro.map(z=><option key={z.ingredienteId} value={z.ingredienteId}>{z.ingredienteDescripcion}</option>)}</select></td>
    <td>{m?.unidadDeMedida??"—"}</td>
    <td><Input className="w-32" type="number" step="any" disabled={!editable} value={x.valor??""} placeholder="Sin valor" onChange={e=>actualizar(i,{valor:e.target.value===""?null:Number(e.target.value)})}/></td>
    <td><select className="h-9 min-w-32 rounded-md border bg-white px-2" disabled={!editable} value={x.idTipoContenido??""} onChange={e=>actualizar(i,{idTipoContenido:e.target.value?Number(e.target.value):null})}><option value="">Sin tipo</option>{tipos.map(t=><option key={t.idTipoContenido} value={t.idTipoContenido}>{t.nombre}</option>)}</select></td>
    <td><Input className="w-20" type="number" min={1} disabled={!editable} value={x.orden} onChange={e=>actualizar(i,{orden:Number(e.target.value)})}/></td>
    <td className="px-5 text-right"><Button type="button" size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>quitar(i)}><Trash2/></Button></td>
   </tr>})}</tbody>
  </table></div>
  {(repetidos||incompletos)&&<div className="mx-5 mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{repetidos?"No se puede repetir el mismo ingrediente.":"Complete el ingrediente y orden de cada fila."}</div>}
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||repetidos||incompletos} onClick={()=>onGuardar({ingredientes:filas})}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
