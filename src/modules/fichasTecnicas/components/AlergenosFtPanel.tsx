import {useEffect,useState} from "react";
import {Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import type {AlergenoFt,GuardarAlergenoFt} from "../types";

type Props={
 items:AlergenoFt[];
 cargando?:boolean;
 guardando?:boolean;
 onGuardar:(items:GuardarAlergenoFt[])=>void;
};

export default function AlergenosFtPanel({items,cargando,guardando,onGuardar}:Props){
 const [filas,setFilas]=useState<AlergenoFt[]>([]);
 const [dirty,setDirty]=useState(false);

 useEffect(()=>{setFilas(items.map(x=>({...x})));setDirty(false)},[items]);

 const patch=(id:number,p:Partial<AlergenoFt>)=>{
  setFilas(actual=>actual.map(x=>x.alergenoId===id?{...x,...p}:x));
  setDirty(true);
 };

 const guardar=()=>onGuardar(filas.map(x=>({
  alergenoId:x.alergenoId,
  enProducto:x.enProducto,
  enLinea:x.enLinea,
  enPlanta:x.enPlanta,
  descripcion:x.descripcion?.trim()||null,
  orden:x.orden
 })));

 return <Card><CardContent className="space-y-4 p-5">
  <div className="border-b pb-4">
   <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--text-secondary)]">Ficha Técnica</p>
   <h2 className="mt-1 text-lg font-semibold">Alérgenos</h2>
   <p className="mt-1 text-sm text-[var(--text-secondary)]">Matriz por producto, línea y planta. La descripción permite indicar el origen del alérgeno.</p>
  </div>

  {cargando?<div className="py-10 text-center text-sm text-[var(--text-secondary)]">Cargando alérgenos...</div>:
   <div className="overflow-x-auto rounded-xl border">
    <table className="w-full min-w-[900px] text-sm">
     <thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]">
      <tr>
       <th className="px-4 py-3">Alimentos alergénicos y productos derivados</th>
       <th className="px-4 py-3 text-center">Producto</th>
       <th className="px-4 py-3 text-center">Línea</th>
       <th className="px-4 py-3 text-center">Planta</th>
       <th className="px-4 py-3">Descripción</th>
      </tr>
     </thead>
     <tbody>
      {filas.map(x=><tr key={x.alergenoId} className="border-t">
       <td className="px-4 py-3 font-medium">{x.alergenoDescripcion}</td>
       <td className="px-4 py-3 text-center"><input type="checkbox" checked={x.enProducto} onChange={e=>patch(x.alergenoId,{enProducto:e.target.checked})}/></td>
       <td className="px-4 py-3 text-center"><input type="checkbox" checked={x.enLinea} onChange={e=>patch(x.alergenoId,{enLinea:e.target.checked})}/></td>
       <td className="px-4 py-3 text-center"><input type="checkbox" checked={x.enPlanta} onChange={e=>patch(x.alergenoId,{enPlanta:e.target.checked})}/></td>
       <td className="px-4 py-3"><Input value={x.descripcion??""} onChange={e=>patch(x.alergenoId,{descripcion:e.target.value})} placeholder="Ej. Huevo, Soya, Leche en polvo"/></td>
      </tr>)}
     </tbody>
    </table>
   </div>
  }

  <div className="flex justify-end border-t pt-4">
   <Button disabled={!dirty||guardando} onClick={guardar}><Save/>{guardando?"Guardando...":"Guardar alérgenos"}</Button>
  </div>
 </CardContent></Card>;
}
