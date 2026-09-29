import {useEffect,useMemo,useState} from "react";
import {Plus,Save,X} from "lucide-react";
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

export default function ResponsablesEditor({responsables,catalogo,editable,guardando,onGuardar}:Props){
 const inicial=useMemo(()=>{
  const x:GuardarResponsablesEt={elaboradoPor:[],revisadoPor:[],aprobadoPor:[]};
  responsables.forEach(r=>{
   const g=tipo(r);
   const historialId=r.usuarioCargoHistorialId;
   if(g&&historialId&&!x[g].includes(historialId))x[g].push(historialId);
  });
  return x;
 },[responsables]);
 const [form,setForm]=useState(inicial);
 const [selects,setSelects]=useState<Record<Grupo,string>>({elaboradoPor:"",revisadoPor:"",aprobadoPor:""});
 useEffect(()=>setForm(inicial),[inicial]);

 const opcion=(id:number)=>catalogo.find(x=>x.usuarioCargoHistorialId===id);
 const agregar=(g:Grupo)=>{
  const id=Number(selects[g]);
  if(!id||form[g].includes(id))return;
  setForm(x=>({...x,[g]:[...x[g],id]}));
  setSelects(x=>({...x,[g]:""}));
 };
 const quitar=(g:Grupo,id:number)=>setForm(x=>({...x,[g]:x[g].filter(v=>v!==id)}));

 const GrupoEditor=({grupo,titulo}:{grupo:Grupo;titulo:string})=><div className="rounded-lg border p-4">
  <div className="mb-3 font-semibold">{titulo}</div>
  <div className="space-y-2">
   {form[grupo].length===0&&<div className="text-sm text-[var(--text-secondary)]">Sin responsables asignados.</div>}
   {form[grupo].map(id=>{
    const u=opcion(id);
    return <div key={id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
     <div>
      <div className="text-sm font-medium">{u?.usuarioNombresApellidos??`Responsable #${id}`}</div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
       <span>{u?.cargoDescripcion??"Cargo histórico"}</span>
       {u?.cargoActual&&<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">Actual</span>}
      </div>
     </div>
     {editable&&<button type="button" className="rounded p-1 hover:bg-slate-200" onClick={()=>quitar(grupo,id)} title="Quitar responsable"><X className="h-4 w-4"/></button>}
    </div>;
   })}
  </div>
  {editable&&<div className="mt-3 flex gap-2">
   <select className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-sm" value={selects[grupo]} onChange={e=>setSelects(x=>({...x,[grupo]:e.target.value}))}>
    <option value="">Seleccionar persona y cargo...</option>
    {catalogo.filter(u=>!form[grupo].includes(u.usuarioCargoHistorialId)).map(u=><option key={u.usuarioCargoHistorialId} value={u.usuarioCargoHistorialId}>{u.usuarioNombresApellidos} — {u.cargoDescripcion}{u.cargoActual?" (Actual)":""}</option>)}
   </select>
   <Button type="button" variant="outline" disabled={!selects[grupo]} onClick={()=>agregar(grupo)}><Plus/>Agregar</Button>
  </div>}
 </div>;

 return <Card><CardContent className="space-y-4 p-5">
  <div><h2 className="font-semibold">Responsables</h2><p className="text-xs text-[var(--text-secondary)]">Selecciona la persona y el cargo que corresponde a esta versión. El cargo queda registrado como parte del historial de la ET.</p></div>
  <GrupoEditor grupo="elaboradoPor" titulo="Elaborado por"/>
  <GrupoEditor grupo="revisadoPor" titulo="Revisado por"/>
  <GrupoEditor grupo="aprobadoPor" titulo="Aprobado por"/>
  <div className="flex justify-end"><Button disabled={!editable||guardando} onClick={()=>onGuardar(form)}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
