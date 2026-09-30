import {useEffect,useMemo,useState} from "react";
import {Check,ChevronDown,Plus,Save,Search,Trash2,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {ContenidoRotuladoCatalogo,DetalleEt,GuardarContenidoRotuladoEt} from "../../types";

type Props={contenido:DetalleEt["contenidoRotulado"];catalogo?:ContenidoRotuladoCatalogo[];editable:boolean;guardando:boolean;onGuardar:(x:GuardarContenidoRotuladoEt)=>void};
type Fila={contRotuladoId:number;orden:number};
export default function ContenidoRotuladoEditor({contenido,catalogo=[],editable,guardando,onGuardar}:Props){
 const inicial=useMemo<Fila[]>(()=>[...contenido].sort((a,b)=>(a.orden??0)-(b.orden??0)).map((x,i)=>({contRotuladoId:x.contRotuladoId,orden:x.orden??i+1})),[contenido]);
 const [filas,setFilas]=useState(inicial);useEffect(()=>setFilas(inicial),[inicial]);
 const [comboAbierto,setComboAbierto]=useState<number|null>(null);
 const [busquedas,setBusquedas]=useState<Record<number,string>>({});
 const usados=new Set(filas.map(x=>x.contRotuladoId));
 const disponibles=catalogo.filter(x=>!usados.has(x.contRotuladoId));
 const agregar=()=>{const x=disponibles[0];if(x)setFilas(v=>[...v,{contRotuladoId:x.contRotuladoId,orden:v.length+1}])};
 const eliminar=(i:number)=>setFilas(v=>v.filter((_,j)=>j!==i).map((x,j)=>({...x,orden:j+1})));
 const cambiar=(i:number,id:number)=>{setFilas(v=>v.map((x,j)=>j===i?{...x,contRotuladoId:id}:x));setComboAbierto(null);setBusquedas(v=>({...v,[i]:""}))};
 const descripcion=(id:number)=>catalogo.find(c=>c.contRotuladoId===id)?.contRotuladoDescripcion??"";
 const opciones=(i:number,idActual:number)=>{const q=(busquedas[i]??"").trim().toLocaleLowerCase();return catalogo.filter(c=>(c.contRotuladoId===idActual||!usados.has(c.contRotuladoId))&&(!q||c.contRotuladoDescripcion.toLocaleLowerCase().includes(q)))};
 const invalid=filas.some(x=>!x.contRotuladoId)||new Set(filas.map(x=>x.contRotuladoId)).size!==filas.length;
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Contenido del rotulado</h2><p className="text-xs text-[var(--text-secondary)]">Seleccione los datos que deben declararse en el rotulado.</p></div><Button disabled={!editable||disponibles.length===0} onClick={agregar}><Plus/>Agregar contenido</Button></div>
  <div className="space-y-3 p-5">{filas.length===0?<div className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin contenido de rotulado registrado.</div>:filas.map((x,i)=><div key={i} className="grid grid-cols-[42px_minmax(0,1fr)_40px] items-center gap-3 rounded-lg border p-3"><div className="flex h-9 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold">{i+1}</div><div className="relative"><button type="button" className="flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60" disabled={!editable} onClick={()=>setComboAbierto(comboAbierto===i?null:i)}><span className="truncate">{descripcion(x.contRotuladoId)||"Seleccione contenido..."}</span><ChevronDown className="h-4 w-4 shrink-0 text-slate-500"/></button>{comboAbierto===i&&editable&&<div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border bg-white shadow-lg"><div className="relative border-b p-2"><Search className="absolute left-4 top-4 h-4 w-4 text-slate-400"/><input autoFocus className="h-9 w-full rounded-md border bg-white pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Escriba para buscar..." value={busquedas[i]??""} onChange={e=>setBusquedas(v=>({...v,[i]:e.target.value}))}/>{busquedas[i]&&<button type="button" className="absolute right-4 top-4" onClick={()=>setBusquedas(v=>({...v,[i]:""}))}><X className="h-4 w-4"/></button>}</div><div className="max-h-56 overflow-y-auto p-1">{opciones(i,x.contRotuladoId).length===0?<div className="px-3 py-4 text-center text-sm text-[var(--text-secondary)]">No se encontraron contenidos.</div>:opciones(i,x.contRotuladoId).map(c=><button type="button" key={c.contRotuladoId} className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-slate-100" onClick={()=>cambiar(i,c.contRotuladoId)}><span>{c.contRotuladoDescripcion}</span>{c.contRotuladoId===x.contRotuladoId&&<Check className="h-4 w-4 shrink-0"/>}</button>)}</div></div>}</div><Button size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>eliminar(i)}><Trash2/></Button></div>)}</div>
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||invalid} onClick={()=>onGuardar({contenidoRotulado:filas.map((x,i)=>({...x,orden:i+1}))})}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
