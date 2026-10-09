import {useEffect,useState} from "react";
import {Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import type {GrupoCaracteristicaFt,GuardarGrupoCaracteristicaFt} from "../types";

type Props={
 grupo:GrupoCaracteristicaFt;
 guardando?:boolean;
 onGuardar:(request:GuardarGrupoCaracteristicaFt)=>void;
};

export default function GrupoCaracteristicaFtEditor({grupo,guardando,onGuardar}:Props){
 const [titulo,setTitulo]=useState(grupo.titulo);
 const [referencia,setReferencia]=useState(grupo.referencia??"");
 const [nota,setNota]=useState(grupo.nota??"");
 const [dirty,setDirty]=useState(false);

 useEffect(()=>{
  setTitulo(grupo.titulo);
  setReferencia(grupo.referencia??"");
  setNota(grupo.nota??"");
  setDirty(false);
 },[grupo]);

 return <div className="rounded-xl border bg-slate-50/50 p-4">
  <div className="grid gap-3 lg:grid-cols-3">
   <label className="text-sm font-medium">
    Título del bloque
    <Input className="mt-1 bg-white" value={titulo} onChange={e=>{setTitulo(e.target.value);setDirty(true)}}/>
   </label>
   <label className="text-sm font-medium lg:col-span-2">
    Referencia
    <Input className="mt-1 bg-white" value={referencia} onChange={e=>{setReferencia(e.target.value);setDirty(true)}} placeholder="Ej. NTS N° 071-MINSA/DIGESA-V.01"/>
   </label>
   <label className="text-sm font-medium lg:col-span-3">
    Nota / condición del bloque
    <textarea className="mt-1 min-h-20 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200" value={nota} onChange={e=>{setNota(e.target.value);setDirty(true)}} placeholder="Ej. (*) Aplica para Ecuador"/>
   </label>
  </div>
  <div className="mt-3 flex justify-end">
   <Button size="sm" disabled={!dirty||guardando||!titulo.trim()} onClick={()=>onGuardar({titulo:titulo.trim(),referencia:referencia.trim()||null,nota:nota.trim()||null,orden:grupo.orden})}>
    <Save/>{guardando?"Guardando...":"Guardar referencia y nota"}
   </Button>
  </div>
 </div>;
}
