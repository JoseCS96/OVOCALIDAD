import {useEffect,useMemo,useState} from "react";
import {Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {DetalleEt,GuardarAnexosEt} from "../../types";
type Props={anexos:DetalleEt["anexos"];editable:boolean;guardando:boolean;onGuardar:(x:GuardarAnexosEt)=>void};
export default function AnexosEditor({anexos,editable,guardando,onGuardar}:Props){
 const inicial=useMemo(()=>anexos.map(x=>x.anexoDescripcion),[anexos]);
 const [filas,setFilas]=useState(inicial);useEffect(()=>setFilas(inicial),[inicial]);
 const normalizadas=filas.map(x=>x.trim().toLocaleUpperCase());
 const invalid=filas.some(x=>!x.trim()||x.length>500)||new Set(normalizadas).size!==filas.length;
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Anexos</h2><p className="text-xs text-[var(--text-secondary)]">Registre las referencias o descripciones de los anexos de esta versión.</p></div><Button disabled={!editable} onClick={()=>setFilas(x=>[...x,""])}><Plus/>Agregar anexo</Button></div>
  <div className="space-y-3 p-5">{filas.length===0?<div className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin anexos registrados.</div>:filas.map((x,i)=><div key={i} className="flex items-start gap-3 rounded-lg border p-3"><div className="flex-1"><label className="mb-1 block text-xs font-medium">Anexo {i+1}</label><textarea maxLength={500} className="min-h-20 w-full resize-y rounded-md border px-3 py-2 text-sm" disabled={!editable} value={x} onChange={e=>setFilas(v=>v.map((a,j)=>j===i?e.target.value:a))}/><div className="text-right text-xs text-[var(--text-secondary)]">{x.length}/500</div></div><Button className="mt-6" size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>setFilas(v=>v.filter((_,j)=>j!==i))}><Trash2/></Button></div>)}</div>
  {invalid&&<div className="mx-5 mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Cada anexo debe tener descripción y no puede repetirse.</div>}
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||invalid} onClick={()=>onGuardar({anexos:filas.map(descripcion=>({descripcion:descripcion.trim()}))})}><Save/>{guardando?"Guardando...":"Guardar anexos"}</Button></div>
 </CardContent></Card>
}
