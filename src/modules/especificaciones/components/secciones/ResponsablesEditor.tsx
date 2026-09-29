import {useEffect,useMemo,useState} from "react";
import {Check,ChevronDown,Save,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {GuardarResponsablesEt,ResponsableCatalogoEt,ResponsableEt} from "../../types";

type Grupo="elaboradoPor"|"revisadoPor"|"aprobadoPor";
type Props={responsables:ResponsableEt[];catalogo:ResponsableCatalogoEt[];editable:boolean;guardando:boolean;onGuardar:(x:GuardarResponsablesEt)=>void};

function tipo(r:ResponsableEt):Grupo|null{
 const t=r.tipoResponsabilidad.toUpperCase();
 if(t.includes("ELABORADO"))return "elaboradoPor";
 if(t.includes("REVISADO"))return "revisadoPor";
 if(t.includes("APROBADO"))return "aprobadoPor";
 return null;
}
function texto(u:ResponsableCatalogoEt){return `${u.usuarioNombresApellidos} — ${u.cargoDescripcion}`}

function MultiComboResponsable({grupo,catalogo,valores,onChange}:{grupo:Grupo;catalogo:ResponsableCatalogoEt[];valores:number[];onChange:(ids:number[])=>void}){
 const [abierto,setAbierto]=useState(false);
 const [busqueda,setBusqueda]=useState("");
 const q=busqueda.trim().toLowerCase();
 const opciones=catalogo.filter(u=>!q||texto(u).toLowerCase().includes(q));
 const toggle=(id:number)=>onChange(valores.includes(id)?valores.filter(x=>x!==id):[...valores,id]);

 return <div className="relative">
  <div className="min-h-10 rounded-md border bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-slate-200">
   <div className="flex flex-wrap items-center gap-1.5">
    {valores.map(id=>{const u=catalogo.find(x=>x.usuarioCargoHistorialId===id);return <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs">
     <span className="truncate">{u?texto(u):`Responsable #${id}`}</span>
     {u?.cargoActual&&<span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">Actual</span>}
     <button type="button" className="rounded p-0.5 hover:bg-slate-200" onMouseDown={e=>e.preventDefault()} onClick={()=>toggle(id)} title="Quitar"><X className="h-3 w-3"/></button>
    </span>})}
    <input
     className="min-w-[220px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
     value={busqueda}
     onFocus={()=>setAbierto(true)}
     onChange={e=>{setBusqueda(e.target.value);setAbierto(true)}}
     onKeyDown={e=>{if(e.key==="Escape")setAbierto(false)}}
     onBlur={()=>window.setTimeout(()=>setAbierto(false),150)}
     placeholder={valores.length?"Agregar otro responsable...":"Buscar persona o cargo..."}
     autoComplete="off"
     aria-label={`Buscar responsables para ${grupo}`}
    />
    <button type="button" tabIndex={-1} className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-500" onMouseDown={e=>e.preventDefault()} onClick={()=>setAbierto(v=>!v)} title="Mostrar opciones"><ChevronDown className="h-4 w-4"/></button>
   </div>
  </div>
  {abierto&&<div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg">
   {opciones.length?opciones.map(u=>{const marcado=valores.includes(u.usuarioCargoHistorialId);return <button key={u.usuarioCargoHistorialId} type="button" tabIndex={-1} className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-slate-50" onMouseDown={e=>{e.preventDefault();toggle(u.usuarioCargoHistorialId);setBusqueda("");setAbierto(true)}}>
    <span className="flex min-w-0 items-center gap-2"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border">{marcado&&<Check className="h-3 w-3"/>}</span><span className="min-w-0"><span className="block truncate font-medium">{u.usuarioNombresApellidos}</span><span className="block truncate text-xs text-[var(--text-secondary)]">{u.cargoDescripcion}</span></span></span>
    {u.cargoActual&&<span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Actual</span>}
   </button>}):<div className="px-3 py-3 text-sm text-[var(--text-secondary)]">No se encontraron coincidencias.</div>}
  </div>}
 </div>
}

export default function ResponsablesEditor({responsables,catalogo,editable,guardando,onGuardar}:Props){
 const inicial=useMemo(()=>{
  const x:GuardarResponsablesEt={elaboradoPor:[],revisadoPor:[],aprobadoPor:[]};
  responsables.forEach(r=>{const g=tipo(r),id=r.usuarioCargoHistorialId;if(g&&id&&!x[g].includes(id))x[g].push(id)});
  return x;
 },[responsables]);
 const [form,setForm]=useState(inicial);
 useEffect(()=>setForm(inicial),[inicial]);

 const GrupoEditor=({grupo,titulo}:{grupo:Grupo;titulo:string})=><div className="rounded-lg border p-4">
  <div className="mb-3 font-semibold">{titulo}</div>
  {editable?<MultiComboResponsable grupo={grupo} catalogo={catalogo} valores={form[grupo]} onChange={ids=>setForm(x=>({...x,[grupo]:ids}))}/>:<div className="space-y-2">
   {form[grupo].length===0&&<div className="text-sm text-[var(--text-secondary)]">Sin responsables asignados.</div>}
   {form[grupo].map(id=>{const u=catalogo.find(x=>x.usuarioCargoHistorialId===id);return <div key={id} className="rounded-md bg-slate-50 px-3 py-2"><div className="text-sm font-medium">{u?.usuarioNombresApellidos??`Responsable #${id}`}</div><div className="text-xs text-[var(--text-secondary)]">{u?.cargoDescripcion??"Cargo histórico"}</div></div>})}
  </div>}
 </div>;

 return <Card><CardContent className="space-y-4 p-5">
  <div><h2 className="font-semibold">Responsables</h2><p className="text-xs text-[var(--text-secondary)]">Puedes seleccionar uno o más responsables por tipo. Cada selección conserva la persona y el cargo correspondiente a esta versión de la ET.</p></div>
  <GrupoEditor grupo="elaboradoPor" titulo="Elaborado por"/>
  <GrupoEditor grupo="revisadoPor" titulo="Revisado por"/>
  <GrupoEditor grupo="aprobadoPor" titulo="Aprobado por"/>
  <div className="flex justify-end"><Button disabled={!editable||guardando} onClick={()=>onGuardar(form)}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
