import {useEffect,useMemo,useState} from "react";
import {ChevronDown,Plus,Save,X} from "lucide-react";
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
function texto(u:ResponsableCatalogoEt){return `${u.usuarioNombresApellidos} — ${u.cargoDescripcion}${u.cargoActual?" (Actual)":""}`}

function ComboResponsable({grupo,catalogo,excluidos,valor,onChange}:{grupo:Grupo;catalogo:ResponsableCatalogoEt[];excluidos:number[];valor:string;onChange:(v:string)=>void}){
 const [abierto,setAbierto]=useState(false);
 const [busqueda,setBusqueda]=useState("");
 const seleccionado=catalogo.find(u=>String(u.usuarioCargoHistorialId)===valor);
 const q=busqueda.trim().toLowerCase();
 const opciones=catalogo.filter(u=>!excluidos.includes(u.usuarioCargoHistorialId)&&(!q||texto(u).toLowerCase().includes(q)));
 return <div className="relative min-w-0 flex-1">
  <div className="relative">
   <input
    className="h-10 w-full rounded-md border bg-white px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-slate-200"
    value={abierto?busqueda:(seleccionado?texto(seleccionado):"")}
    onFocus={()=>{setBusqueda("");setAbierto(true)}}
    onChange={e=>{setBusqueda(e.target.value);setAbierto(true)}}
    onKeyDown={e=>{if(e.key==="Escape"){setAbierto(false);setBusqueda("")}}}
    onBlur={()=>window.setTimeout(()=>setAbierto(false),150)}
    placeholder="Buscar persona o cargo..."
    autoComplete="off"
    aria-label={`Buscar responsable para ${grupo}`}
   />
   <button type="button" tabIndex={-1} className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-slate-500" onMouseDown={e=>e.preventDefault()} onClick={()=>{setBusqueda("");setAbierto(v=>!v)}} title="Mostrar opciones"><ChevronDown className="h-4 w-4"/></button>
  </div>
  {abierto&&<div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg">
   {opciones.length?opciones.map(u=><button key={u.usuarioCargoHistorialId} type="button" tabIndex={-1} className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-slate-50" onMouseDown={e=>{e.preventDefault();onChange(String(u.usuarioCargoHistorialId));setBusqueda("");setAbierto(false)}}>
    <span className="min-w-0"><span className="block truncate font-medium">{u.usuarioNombresApellidos}</span><span className="block truncate text-xs text-[var(--text-secondary)]">{u.cargoDescripcion}</span></span>
    {u.cargoActual&&<span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Actual</span>}
   </button>):<div className="px-3 py-3 text-sm text-[var(--text-secondary)]">No se encontraron coincidencias.</div>}
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
 const [selects,setSelects]=useState<Record<Grupo,string>>({elaboradoPor:"",revisadoPor:"",aprobadoPor:""});
 useEffect(()=>setForm(inicial),[inicial]);
 const opcion=(id:number)=>catalogo.find(x=>x.usuarioCargoHistorialId===id);
 const seleccionado=(g:Grupo)=>{const raw=selects[g];const id=Number(raw);return catalogo.find(x=>x.usuarioCargoHistorialId===id)};
 const agregar=(g:Grupo)=>{const u=seleccionado(g);if(!u||form[g].includes(u.usuarioCargoHistorialId))return;setForm(x=>({...x,[g]:[...x[g],u.usuarioCargoHistorialId]}));setSelects(x=>({...x,[g]:""}))};
 const quitar=(g:Grupo,id:number)=>setForm(x=>({...x,[g]:x[g].filter(v=>v!==id)}));

 const GrupoEditor=({grupo,titulo}:{grupo:Grupo;titulo:string})=><div className="rounded-lg border p-4">
  <div className="mb-3 font-semibold">{titulo}</div>
  <div className="space-y-2">
   {form[grupo].length===0&&<div className="text-sm text-[var(--text-secondary)]">Sin responsables asignados.</div>}
   {form[grupo].map(id=>{const u=opcion(id);return <div key={id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
    <div><div className="text-sm font-medium">{u?.usuarioNombresApellidos??`Responsable #${id}`}</div><div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]"><span>{u?.cargoDescripcion??"Cargo histórico"}</span>{u?.cargoActual&&<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">Actual</span>}</div></div>
    {editable&&<button type="button" className="rounded p-1 hover:bg-slate-200" onClick={()=>quitar(grupo,id)} title="Quitar responsable"><X className="h-4 w-4"/></button>}
   </div>})}
  </div>
  {editable&&<div className="mt-3 flex gap-2">
   <ComboResponsable grupo={grupo} catalogo={catalogo} excluidos={form[grupo]} valor={selects[grupo]} onChange={v=>setSelects(x=>({...x,[grupo]:v}))}/>
   <Button type="button" variant="outline" disabled={!seleccionado(grupo)} onClick={()=>agregar(grupo)}><Plus/>Agregar</Button>
  </div>}
 </div>;

 return <Card><CardContent className="space-y-4 p-5">
  <div><h2 className="font-semibold">Responsables</h2><p className="text-xs text-[var(--text-secondary)]">Selecciona la persona y el cargo que corresponde a esta versión. El cargo queda registrado como parte del historial de la ET.</p></div>
  <GrupoEditor grupo="elaboradoPor" titulo="Elaborado por"/>
  <GrupoEditor grupo="revisadoPor" titulo="Revisado por"/>
  <GrupoEditor grupo="aprobadoPor" titulo="Aprobado por"/>
  <div className="flex justify-end"><Button disabled={!editable||guardando} onClick={()=>{
   const payload:GuardarResponsablesEt={
    elaboradoPor:[...form.elaboradoPor],
    revisadoPor:[...form.revisadoPor],
    aprobadoPor:[...form.aprobadoPor]
   };
   (["elaboradoPor","revisadoPor","aprobadoPor"] as Grupo[]).forEach(g=>{
    const u=seleccionado(g);
    if(u&&!payload[g].includes(u.usuarioCargoHistorialId))payload[g].push(u.usuarioCargoHistorialId);
   });
   onGuardar(payload);
  }}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
