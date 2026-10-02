import {useEffect,useMemo,useState} from "react";
import {Plus,Save,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import type {CatalogosTratamientosEt,GuardarParametroTratamientoEt,GuardarTratamientoEt,GuardarTratamientosEt,ParametroTratamientoEt,TratamientoEt} from "../../types";

type Props={tratamientos:TratamientoEt[];parametros:ParametroTratamientoEt[];catalogos?:CatalogosTratamientosEt;editable:boolean;guardando:boolean;onGuardar:(x:GuardarTratamientosEt)=>void};
const paramNuevo=(orden:number):GuardarParametroTratamientoEt=>({parametroTratId:0,tipoCriterioId:1,valorCuantitativoInicial:null,valorCuantitativoFinal:null,valorCuantitativoIgual:null,valorCualitativo:null,orden});
const limpiar=(p:GuardarParametroTratamientoEt,tipo:number)=>({...p,tipoCriterioId:tipo,valorCuantitativoInicial:null,valorCuantitativoFinal:null,valorCuantitativoIgual:null,valorCualitativo:tipo===4?"Ausencia":null});
export default function TratamientosEditor({tratamientos,parametros,catalogos,editable,guardando,onGuardar}:Props){
 const inicial=useMemo<GuardarTratamientoEt[]>(()=>tratamientos.map(t=>({tratConservId:t.tratConservId,parametros:parametros.filter(p=>p.versTratConsId===t.versTratConsId).sort((a,b)=>(a.orden??0)-(b.orden??0)).map((p,i)=>({parametroTratId:p.parametroTratId,tipoCriterioId:p.tipoCriterioId,valorCuantitativoInicial:p.valorCuantitativoInicial,valorCuantitativoFinal:p.valorCuantitativoFinal,valorCuantitativoIgual:p.valorCuantitativoIgual,valorCualitativo:p.valorCualitativo,orden:p.orden??i+1}))})),[tratamientos,parametros]);
 const [filas,setFilas]=useState<GuardarTratamientoEt[]>(inicial);useEffect(()=>setFilas(inicial),[inicial]);
 // La unidad elegida es solo de presentación: el contrato de la API guarda minutos.
 const [unidadesTiempo,setUnidadesTiempo]=useState<Record<string,"Minutos"|"Horas"|"Días">>({});
 const factor=(unidad:"Minutos"|"Horas"|"Días")=>unidad==="Días"?1440:unidad==="Horas"?60:1;
 const unidadFila=(i:number,j:number)=>unidadesTiempo[`${i}-${j}`]??"Minutos";
 const mostrar=(valor:number|null,unidad:"Minutos"|"Horas"|"Días")=>valor===null?"":Number((valor/factor(unidad)).toFixed(8));
 const aMinutos=(valor:string,unidad:"Minutos"|"Horas"|"Días")=>valor===""?null:Number((Number(valor)*factor(unidad)).toFixed(4));
 const setTrat=(i:number,x:GuardarTratamientoEt)=>setFilas(v=>v.map((a,j)=>j===i?x:a));
 const invalid=filas.some(t=>{
  const parametrosInvalidos=t.parametros.some(p=>
   !p.parametroTratId||
   !p.tipoCriterioId||
   p.orden<=0||
   (p.tipoCriterioId===1&&p.valorCuantitativoInicial==null)||
   (p.tipoCriterioId===2&&p.valorCuantitativoFinal==null)||
   (p.tipoCriterioId===3&&(p.valorCuantitativoInicial==null||p.valorCuantitativoFinal==null))||
   ([4,5].includes(p.tipoCriterioId)&&!p.valorCualitativo?.trim())
  );
  const parametrosDuplicados=new Set(t.parametros.map(p=>p.parametroTratId)).size!==t.parametros.length;
  return !t.tratConservId||parametrosInvalidos||parametrosDuplicados;
 })||new Set(filas.map(t=>t.tratConservId)).size!==filas.length;
 const n=(v:string)=>v===""?null:Number(v);
 return <Card><CardContent className="p-0">
  <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Tratamientos de conservación</h2><p className="text-xs text-[var(--text-secondary)]">Configura el tratamiento y sus parámetros de control.</p></div><Button disabled={!editable} onClick={()=>setFilas(x=>[...x,{tratConservId:0,parametros:[]}])}><Plus/>Agregar tratamiento</Button></div>
  <div className="space-y-4 p-5">{filas.length===0?<div className="py-8 text-center text-sm text-[var(--text-secondary)]">Sin tratamientos registrados.</div>:filas.map((t,i)=><div key={i} className="rounded-xl border">
   <div className="flex gap-3 border-b bg-slate-50 p-4"><select className="h-9 min-w-64 rounded-md border bg-white px-2 text-sm" disabled={!editable} value={t.tratConservId} onChange={e=>setTrat(i,{...t,tratConservId:Number(e.target.value)})}><option value={0}>Seleccione tratamiento...</option>{catalogos?.tratamientos.map(x=><option key={x.tratConservId} value={x.tratConservId}>{x.tratConservDescripcion}</option>)}</select><Button variant="outline" disabled={!editable} onClick={()=>setTrat(i,{...t,parametros:[...t.parametros,paramNuevo(t.parametros.length+1)]})}><Plus/>Parámetro</Button><Button size="icon-sm" variant="destructive" className="ml-auto" disabled={!editable} onClick={()=>setFilas(x=>x.filter((_,j)=>j!==i))}><Trash2/></Button></div>
   <div className="space-y-3 p-4">{t.parametros.map((p,j)=>{const maestro=catalogos?.parametros.find(x=>x.paramTratId===p.parametroTratId);const criterio=catalogos?.tiposCriterio.find(x=>x.tipoCriterioId===p.tipoCriterioId)?.tipCritDescripcion;const esTiempo=maestro?.paramTratDescripcion.trim().toLowerCase()==="tiempo"&&maestro.paramTratUnidadDeMedida?.trim().toLowerCase()==="minutos";const unidad=unidadFila(i,j);const cambio=(q:Partial<GuardarParametroTratamientoEt>)=>setTrat(i,{...t,parametros:t.parametros.map((a,k)=>k===j?{...a,...q}:a)});return <div key={j} className="grid gap-2 rounded-lg border p-3 lg:grid-cols-[1.4fr_1fr_1fr_80px_40px]">
    <select className="h-9 rounded-md border bg-white px-2 text-sm" disabled={!editable} value={p.parametroTratId} onChange={e=>cambio({parametroTratId:Number(e.target.value)})}><option value={0}>Seleccione parámetro...</option>{catalogos?.parametros.map(x=><option key={x.paramTratId} value={x.paramTratId}>{x.paramTratDescripcion}{x.paramTratUnidadDeMedida?" · "+x.paramTratUnidadDeMedida:""}</option>)}</select>
    <select className="h-9 rounded-md border bg-white px-2 text-sm" disabled={!editable} value={p.tipoCriterioId} onChange={e=>{const z=limpiar(p,Number(e.target.value));setTrat(i,{...t,parametros:t.parametros.map((a,k)=>k===j?z:a)})}}>{catalogos?.tiposCriterio.map(x=><option key={x.tipoCriterioId} value={x.tipoCriterioId}>{x.tipCritDescripcion}</option>)}</select>
    <div>{criterio==="MINIMO"?<Input type="number" step="any" placeholder="Mínimo" value={esTiempo?mostrar(p.valorCuantitativoInicial,unidad):p.valorCuantitativoInicial??""} onChange={e=>cambio({valorCuantitativoInicial:esTiempo?aMinutos(e.target.value,unidad):n(e.target.value)})}/>:criterio==="MAXIMO"?<Input type="number" step="any" placeholder="Máximo" value={esTiempo?mostrar(p.valorCuantitativoFinal,unidad):p.valorCuantitativoFinal??""} onChange={e=>cambio({valorCuantitativoFinal:esTiempo?aMinutos(e.target.value,unidad):n(e.target.value)})}/>:criterio==="RANGO"?<div className="flex gap-1"><Input type="number" step="any" placeholder="Mín." value={esTiempo?mostrar(p.valorCuantitativoInicial,unidad):p.valorCuantitativoInicial??""} onChange={e=>cambio({valorCuantitativoInicial:esTiempo?aMinutos(e.target.value,unidad):n(e.target.value)})}/><Input type="number" step="any" placeholder="Máx." value={esTiempo?mostrar(p.valorCuantitativoFinal,unidad):p.valorCuantitativoFinal??""} onChange={e=>cambio({valorCuantitativoFinal:esTiempo?aMinutos(e.target.value,unidad):n(e.target.value)})}/></div>:<Input disabled={criterio==="AUSENCIA"||!editable} value={p.valorCualitativo??""} placeholder="Valor cualitativo" onChange={e=>cambio({valorCualitativo:e.target.value})}/>}</div>
    <Input type="number" min={1} disabled={!editable} value={p.orden} onChange={e=>cambio({orden:Number(e.target.value)})}/>
    <Button size="icon-sm" variant="destructive" disabled={!editable} onClick={()=>setTrat(i,{...t,parametros:t.parametros.filter((_,k)=>k!==j).map((a,k)=>({...a,orden:k+1}))})}><Trash2/></Button>
    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] lg:col-span-5">{esTiempo?<><label className="flex items-center gap-2">Unidad de ingreso <select className="h-8 rounded-md border bg-white px-2 text-sm" disabled={!editable} value={unidad} onChange={e=>setUnidadesTiempo(v=>({...v,[`${i}-${j}`]:e.target.value as "Minutos"|"Horas"|"Días"}))}><option>Minutos</option><option>Horas</option><option>Días</option></select></label><span>Se guardará en minutos (unidad del maestro).</span></>:maestro?.paramTratUnidadDeMedida?"Unidad: "+maestro.paramTratUnidadDeMedida:"Sin unidad"}</div>
   </div>})}</div>
  </div>)}</div>
  {invalid&&<div className="mx-5 mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Complete tratamientos, parámetros, criterios y valores requeridos sin duplicados.</div>}
  <div className="flex justify-end border-t p-5"><Button disabled={!editable||guardando||invalid} onClick={()=>onGuardar({tratamientos:filas})}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </CardContent></Card>
}
