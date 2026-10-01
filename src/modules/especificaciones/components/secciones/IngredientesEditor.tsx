import {useEffect,useMemo,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {Check,ChevronDown,Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import type {CatalogosIngredientesEt,GuardarIngredienteEt,GuardarIngredientesEt,IngredienteEt} from "../../types";

type Props={ingredientes:IngredienteEt[];catalogos?:CatalogosIngredientesEt;editable:boolean;guardando:boolean;onGuardar:(x:GuardarIngredientesEt)=>void};
function ComboIngrediente({maestro,valor,disabled,onChange}:{maestro:CatalogosIngredientesEt["ingredientes"];valor:number;disabled:boolean;onChange:(id:number)=>void}){
 const [abierto,setAbierto]=useState(false),[busqueda,setBusqueda]=useState(""),[rect,setRect]=useState<DOMRect|null>(null);
 const anchor=useRef<HTMLDivElement>(null);
 const seleccionado=maestro.find(x=>x.ingredienteId===valor);
 const q=busqueda.trim().toLowerCase();
 const opciones=maestro.filter(x=>!q||x.ingredienteDescripcion.toLowerCase().includes(q)||(x.unidadDeMedida??"").toLowerCase().includes(q));
 const posicionar=()=>anchor.current&&setRect(anchor.current.getBoundingClientRect());
 useEffect(()=>{if(!abierto)return;posicionar();const fn=()=>posicionar();window.addEventListener("resize",fn);window.addEventListener("scroll",fn,true);return()=>{window.removeEventListener("resize",fn);window.removeEventListener("scroll",fn,true)}},[abierto]);
 const menu=abierto&&!disabled&&rect?createPortal(<div style={{position:"fixed",left:rect.left,top:rect.bottom+4,width:rect.width,zIndex:9999}} className="max-h-64 overflow-auto rounded-md border bg-white p-1 shadow-2xl">{opciones.length?opciones.map(x=><button key={x.ingredienteId} type="button" tabIndex={-1} className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-slate-50" onMouseDown={e=>{e.preventDefault();onChange(x.ingredienteId);setBusqueda("");setAbierto(false)}}><span className="min-w-0"><span className="block truncate font-medium">{x.ingredienteDescripcion}</span><span className="block text-xs text-[var(--text-secondary)]">{x.unidadDeMedida??"Sin unidad"}</span></span>{valor===x.ingredienteId&&<Check className="h-4 w-4 shrink-0"/>}</button>):<div className="px-3 py-3 text-sm text-[var(--text-secondary)]">No se encontraron coincidencias.</div>}</div>,document.body):null;
 return <div ref={anchor} className="relative min-w-64">
  <div className="flex h-9 items-center rounded-md border bg-white px-2 focus-within:ring-2 focus-within:ring-slate-200">
   <input disabled={disabled} className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed" value={abierto?busqueda:(seleccionado?.ingredienteDescripcion??"")} placeholder="Buscar ingrediente..." onFocus={()=>{setBusqueda("");posicionar();setAbierto(true)}} onChange={e=>{setBusqueda(e.target.value);posicionar();setAbierto(true)}} onBlur={()=>window.setTimeout(()=>setAbierto(false),150)} onKeyDown={e=>{if(e.key==="Escape")setAbierto(false)}} autoComplete="off"/>
   <button type="button" tabIndex={-1} disabled={disabled} className="ml-1 text-slate-500" onMouseDown={e=>e.preventDefault()} onClick={()=>{setBusqueda("");posicionar();setAbierto(v=>!v)}}><ChevronDown className="h-4 w-4"/></button>
  </div>
  {menu}
 </div>
}
const nueva=(orden:number):GuardarIngredienteEt=>({ingredienteId:0,unidadDeMedida:null,valor:null,idTipoContenido:3,orden});
export default function IngredientesEditor({ingredientes,catalogos,editable,guardando,onGuardar}:Props){
 const inicial=useMemo(()=>[...ingredientes].sort((a,b)=>(a.orden??0)-(b.orden??0)).map((x,i)=>({ingredienteId:x.ingredienteId,unidadDeMedida:x.unidadDeMedida,valor:x.versIngrValor,idTipoContenido:x.idTipoContenido,orden:x.orden??i+1})),[ingredientes]);
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
  <div className="overflow-x-auto overflow-y-visible"><table className="w-full min-w-[850px] text-sm"><thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Ingrediente</th><th>Unidad</th><th>Valor</th><th>Tipo contenido</th><th className="w-24">Orden</th><th className="px-5 text-right">Acciones</th></tr></thead>
   <tbody>{filas.length===0?<tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--text-secondary)]">Sin ingredientes registrados.</td></tr>:filas.map((x,i)=>{return <tr key={i} className="border-t">
    <td className="relative overflow-visible px-5 py-3"><ComboIngrediente maestro={maestro} valor={x.ingredienteId} disabled={!editable} onChange={id=>actualizar(i,{ingredienteId:id})}/></td>
    <td><Input className="w-28" maxLength={30} disabled={!editable} value={x.unidadDeMedida??""} placeholder="Opcional" onChange={e=>actualizar(i,{unidadDeMedida:e.target.value||null})}/></td>
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
