import {useEffect,useState} from "react";
import {ArrowDown,ArrowUp,Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import type {DeclaracionFt,GuardarDeclaracionFt} from "../types";

type Props={
 items:DeclaracionFt[];
 cargando?:boolean;
 guardando?:boolean;
 onGuardar:(items:GuardarDeclaracionFt[])=>void;
};

const base:GuardarDeclaracionFt[]=[
 {codigo:"NO_GMO",titulo:"Declaración de No GMO",descripcion:"Este producto no contiene materias primas genéticamente modificadas.",orden:1},
 {codigo:"NO_IRRADIACION",titulo:"Declaración de No Irradiación",descripcion:"Este producto no ha sido irradiado.",orden:2},
 {codigo:"ORIGEN",titulo:"Declaración de Origen",descripcion:"Perú.",orden:3},
 {codigo:"SEGURIDAD_MANIPULACION",titulo:"Seguridad y manipulación",descripcion:"La hoja de seguridad del material está disponible según se requiera.",orden:4},
];

export default function DeclaracionesFtPanel({items,cargando,guardando,onGuardar}:Props){
 const [filas,setFilas]=useState<GuardarDeclaracionFt[]>([]);
 const [dirty,setDirty]=useState(false);

 useEffect(()=>{
  setFilas(items.map(x=>({codigo:x.codigo,titulo:x.titulo,descripcion:x.descripcion,orden:x.orden})));
  setDirty(false);
 },[items]);

 const normalizar=(xs:GuardarDeclaracionFt[])=>xs.map((x,i)=>({...x,orden:i+1}));
 const patch=(i:number,p:Partial<GuardarDeclaracionFt>)=>{
  setFilas(actual=>actual.map((x,k)=>k===i?{...x,...p}:x));
  setDirty(true);
 };
 const agregar=()=>{
  setFilas(actual=>[...actual,{codigo:`CUSTOM_${Date.now()}`,titulo:"Nueva declaración",descripcion:"",orden:actual.length+1}]);
  setDirty(true);
 };
 const quitar=(i:number)=>{
  setFilas(actual=>normalizar(actual.filter((_,k)=>k!==i)));
  setDirty(true);
 };
 const mover=(i:number,dir:-1|1)=>{
  setFilas(actual=>{
   const j=i+dir;if(j<0||j>=actual.length)return actual;
   const n=[...actual];[n[i],n[j]]=[n[j],n[i]];
   return normalizar(n);
  });
  setDirty(true);
 };
 const cargarBase=()=>{setFilas(base.map(x=>({...x})));setDirty(true)};
 const guardar=()=>onGuardar(normalizar(filas).map(x=>({...x,titulo:x.titulo.trim(),descripcion:x.descripcion?.trim()||null})));

 return <Card><CardContent className="space-y-4 p-5">
  <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
   <div>
    <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--text-secondary)]">Ficha Técnica</p>
    <h2 className="mt-1 text-lg font-semibold">Declaraciones</h2>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">Información declarativa propia de la FT. No modifica la Especificación Técnica de origen.</p>
   </div>
   <div className="flex flex-wrap gap-2">
    {filas.length===0&&<Button type="button" variant="outline" onClick={cargarBase}>Cargar base OVOSUR</Button>}
    <Button type="button" variant="outline" onClick={agregar}><Plus/>Agregar declaración</Button>
   </div>
  </div>

  {cargando?<div className="py-10 text-center text-sm text-[var(--text-secondary)]">Cargando declaraciones...</div>:
   filas.length===0?<div className="rounded-xl border border-dashed p-8 text-center text-sm text-[var(--text-secondary)]">No hay declaraciones registradas para esta FT.</div>:
   <div className="space-y-3">
    {filas.map((x,i)=><div key={x.codigo} className="rounded-xl border bg-white p-4">
     <div className="grid gap-3 lg:grid-cols-[minmax(220px,.8fr)_minmax(0,2fr)_auto]">
      <div>
       <label className="text-xs font-medium text-[var(--text-secondary)]">Título</label>
       <Input className="mt-1" value={x.titulo} onChange={e=>patch(i,{titulo:e.target.value})}/>
      </div>
      <div>
       <label className="text-xs font-medium text-[var(--text-secondary)]">Descripción</label>
       <Input className="mt-1" value={x.descripcion??""} onChange={e=>patch(i,{descripcion:e.target.value})}/>
      </div>
      <div className="flex items-end justify-end gap-1">
       <Button type="button" size="icon-sm" variant="outline" title="Subir" disabled={i===0} onClick={()=>mover(i,-1)}><ArrowUp/></Button>
       <Button type="button" size="icon-sm" variant="outline" title="Bajar" disabled={i===filas.length-1} onClick={()=>mover(i,1)}><ArrowDown/></Button>
       <Button type="button" size="icon-sm" variant="outline" title="Quitar" onClick={()=>quitar(i)}><Trash2/></Button>
      </div>
     </div>
    </div>)}
   </div>
  }

  <div className="flex justify-end border-t pt-4">
   <Button disabled={!dirty||guardando||filas.some(x=>!x.titulo.trim())} onClick={guardar}><Save/>{guardando?"Guardando...":"Guardar declaraciones"}</Button>
  </div>
 </CardContent></Card>;
}
