import {useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowLeft,Check,ChevronDown,ChevronUp,Filter,Plus,Save,Trash2} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {obtenerCatalogosEt,obtenerSeccionesEt} from "@/modules/especificaciones/api";
import {
 agregarSeccionFt,guardarCaracteristicaFt,guardarContenidoSeccionFt,listarCaracteristicasFt,
 listarSeccionesFt,obtenerFt,quitarSeccionFt,reordenarSeccionesFt
} from "./api";
import type {CaracteristicaFt,SeccionFt} from "./types";

const numero=(v:string)=>v===""?null:Number(v);

export default function EditarFichaTecnicaPage(){
 const id=Number(useParams().versionId),nav=useNavigate(),qc=useQueryClient();
 const ft=useQuery({queryKey:["ft",id],queryFn:()=>obtenerFt(id),enabled:Number.isFinite(id)});
 const chars=useQuery({queryKey:["ft-caracteristicas",id],queryFn:()=>listarCaracteristicasFt(id),enabled:Number.isFinite(id)});
 const secciones=useQuery({queryKey:["ft-secciones",id],queryFn:()=>listarSeccionesFt(id),enabled:Number.isFinite(id)});
 const seccionesCatalogo=useQuery({queryKey:["secciones-et-catalogo"],queryFn:obtenerSeccionesEt});
 const cats=useQuery({queryKey:["catalogos-et"],queryFn:obtenerCatalogosEt});

 const [editando,setEditando]=useState<Record<number,CaracteristicaFt>>({});
 const [tipoFiltro,setTipoFiltro]=useState("TODOS");
 const [contenidoEditado,setContenidoEditado]=useState<Record<number,string>>({});
 const [seccionNueva,setSeccionNueva]=useState("");

 const filas=useMemo(()=>chars.data??[],[chars.data]);
 const filasSecciones=useMemo(()=>[...(secciones.data??[])].sort((a,b)=>(a.orden??9999)-(b.orden??9999)),[secciones.data]);
 const tipos=useMemo(()=>{
  const valores=filas.map(x=>x.tipoCaractDescripcion?.trim()).filter((x):x is string=>!!x);
  return ["TODOS",...Array.from(new Set(valores)).sort((a,b)=>a.localeCompare(b))];
 },[filas]);
 const filasFiltradas=useMemo(()=>tipoFiltro==="TODOS"?filas:filas.filter(x=>x.tipoCaractDescripcion===tipoFiltro),[filas,tipoFiltro]);

 const disponibles=useMemo(()=>{
  const usados=new Set(filasSecciones.map(x=>x.seccionId));
  return (seccionesCatalogo.data?.secciones??[]).filter(x=>!usados.has(x.seccionId));
 },[seccionesCatalogo.data,filasSecciones]);

 const guardar=useMutation({
  mutationFn:(x:CaracteristicaFt)=>guardarCaracteristicaFt(id,{
   versionFtCaracteristicaId:x.versionFtCaracteristicaId,caracteristicaId:x.caracteristicaId,tipoCriterioId:x.tipoCriterioId,
   valorCuantitativoInicial:x.valorCuantitativoInicial,valorCuantitativoFinal:x.valorCuantitativoFinal,valorCuantitativoIgual:x.valorCuantitativoIgual,
   valorCualitativo:x.valorCualitativo,unidadDeMedida:x.unidadDeMedida,imprimeCertificado:x.imprimeCertificado,
   obligatorioCertificado:x.obligatorioCertificado,ordenCertificado:x.imprimeCertificado?x.ordenCertificado:null
  }),
  onSuccess:(_,x)=>{
   setEditando(a=>{const n={...a};delete n[x.versionFtCaracteristicaId];return n});
   qc.invalidateQueries({queryKey:["ft-caracteristicas",id]});qc.invalidateQueries({queryKey:["fichas-tecnicas"]});
  }
 });

 const guardarSeccion=useMutation({
  mutationFn:(x:SeccionFt)=>guardarContenidoSeccionFt(id,x.versSeccId,contenidoEditado[x.versSeccId]??x.contenido??""),
  onSuccess:(_,x)=>{
   setContenidoEditado(a=>{const n={...a};delete n[x.versSeccId];return n});
   qc.invalidateQueries({queryKey:["ft-secciones",id]});
  }
 });

 const agregarSeccion=useMutation({
  mutationFn:(seccionId:number)=>agregarSeccionFt(id,seccionId,null),
  onSuccess:()=>{setSeccionNueva("");qc.invalidateQueries({queryKey:["ft-secciones",id]})}
 });

 const quitarSeccion=useMutation({
  mutationFn:(versSeccId:number)=>quitarSeccionFt(id,versSeccId),
  onSuccess:()=>qc.invalidateQueries({queryKey:["ft-secciones",id]})
 });

 const moverSeccion=useMutation({
  mutationFn:async({versSeccId,direccion}:{versSeccId:number;direccion:-1|1})=>{
   const arr=[...filasSecciones];
   const i=arr.findIndex(x=>x.versSeccId===versSeccId),j=i+direccion;
   if(i<0||j<0||j>=arr.length)return;
   [arr[i],arr[j]]=[arr[j],arr[i]];
   await reordenarSeccionesFt(id,{secciones:arr.map((x,k)=>({versSeccId:x.versSeccId,orden:k+1}))});
  },
  onSuccess:()=>qc.invalidateQueries({queryKey:["ft-secciones",id]})
 });

 const valor=(x:CaracteristicaFt)=>editando[x.versionFtCaracteristicaId]??x;
 const patch=(x:CaracteristicaFt,p:Partial<CaracteristicaFt>)=>setEditando(a=>({...a,[x.versionFtCaracteristicaId]:{...valor(x),...p}}));
 const criterioNombre=(x:CaracteristicaFt)=>cats.data?.tiposCriterio.find(t=>t.tipoCriterioId===x.tipoCriterioId)?.tipoCriterio?.toUpperCase()??"";
 const cambiarCriterio=(base:CaracteristicaFt,tipoCriterioId:number)=>{
  const nombre=cats.data?.tiposCriterio.find(t=>t.tipoCriterioId===tipoCriterioId)?.tipoCriterio?.toUpperCase()??"";
  const p:Partial<CaracteristicaFt>={tipoCriterioId,valorCuantitativoInicial:null,valorCuantitativoFinal:null,valorCuantitativoIgual:null,valorCualitativo:null};
  if(nombre==="AUSENCIA")p.valorCualitativo="Ausencia";patch(base,p);
 };
 const marcarVisibles=(marcar:boolean)=>setEditando(actual=>{
  const nuevo={...actual};filasFiltradas.forEach(base=>{const x=actual[base.versionFtCaracteristicaId]??base;nuevo[base.versionFtCaracteristicaId]={...x,imprimeCertificado:marcar,obligatorioCertificado:marcar?x.obligatorioCertificado:false,ordenCertificado:marcar?(x.ordenCertificado??1):null}});return nuevo;
 });

 return <PageContainer className="space-y-5">
  <div className="flex items-start justify-between">
   <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental · Ficha técnica</p>
    <h1 className="mt-1 text-2xl font-semibold">{ft.data?.productoCodigo} · {ft.data?.documentoCodigo}</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{ft.data?.documentoDescripcionDocumento} · v{ft.data?.versionNumero} · {ft.data?.estadoVersion}</p>
   </div>
   <Button variant="outline" onClick={()=>nav("/documentos/fichas-tecnicas")}><ArrowLeft/>Volver</Button>
  </div>

  <Card><CardContent className="p-5">
   <h2 className="font-semibold">Contenido de la Ficha Técnica</h2>
   <p className="mt-1 text-sm text-[var(--text-secondary)]">La FT parte de la estructura de la ET, pero desde aquí el contenido es independiente y puede ajustarse para comunicación al cliente.</p>
  </CardContent></Card>

  <Card><CardContent className="space-y-4 p-4">
   <div className="flex flex-wrap items-end gap-2">
    <label className="min-w-72 flex-1 space-y-1"><span className="text-sm font-medium">Agregar sección</span>
     <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={seccionNueva} onChange={e=>setSeccionNueva(e.target.value)}>
      <option value="">Seleccione una sección disponible</option>
      {disponibles.map(s=><option key={s.seccionId} value={s.seccionId}>{s.seccionDescripcion}</option>)}
     </select>
    </label>
    <Button type="button" disabled={!seccionNueva||agregarSeccion.isPending} onClick={()=>agregarSeccion.mutate(Number(seccionNueva))}><Plus/>Agregar</Button>
   </div>

   <div className="space-y-3">
    {filasSecciones.map((s,index)=>{
     const texto=contenidoEditado[s.versSeccId]??s.contenido??"";
     const cambiado=Object.prototype.hasOwnProperty.call(contenidoEditado,s.versSeccId);
     return <div key={s.versSeccId} className="rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
       <div><p className="font-semibold">{index+1}. {s.seccionDescripcion}</p><p className="text-xs text-[var(--text-secondary)]">{s.tipoSeccionDescripcion??"Sección FT"}</p></div>
       <div className="flex gap-1">
        <Button type="button" size="sm" variant="outline" disabled={index===0||moverSeccion.isPending} onClick={()=>moverSeccion.mutate({versSeccId:s.versSeccId,direccion:-1})}><ChevronUp/></Button>
        <Button type="button" size="sm" variant="outline" disabled={index===filasSecciones.length-1||moverSeccion.isPending} onClick={()=>moverSeccion.mutate({versSeccId:s.versSeccId,direccion:1})}><ChevronDown/></Button>
        <Button type="button" size="sm" variant="outline" className="text-red-600" disabled={quitarSeccion.isPending} onClick={()=>{if(window.confirm(`¿Retirar la sección "${s.seccionDescripcion}" de esta FT?`))quitarSeccion.mutate(s.versSeccId)}}><Trash2/>Quitar</Button>
       </div>
      </div>
      <textarea className="min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm" value={texto} onChange={e=>setContenidoEditado(a=>({...a,[s.versSeccId]:e.target.value}))} placeholder="Contenido de la sección en la ficha técnica..."/>
      <div className="mt-2 flex justify-end"><Button type="button" size="sm" disabled={!cambiado||guardarSeccion.isPending} onClick={()=>guardarSeccion.mutate(s)}><Save/>Guardar sección</Button></div>
     </div>
    })}
    {!filasSecciones.length&&<div className="rounded-lg border border-dashed p-6 text-center text-sm text-[var(--text-secondary)]">Esta FT todavía no tiene secciones configuradas.</div>}
   </div>
  </CardContent></Card>

  <Card><CardContent className="p-5">
   <h2 className="font-semibold">Características de la Ficha Técnica</h2>
   <p className="mt-1 text-sm text-[var(--text-secondary)]">La FT parte de la ET, pero su especificación es independiente. Calidad puede ajustar criterio, valores, unidad y qué parámetros se comunicarán en el certificado.</p>
  </CardContent></Card>

  <Card><CardContent className="space-y-4 p-4">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-2 text-sm font-medium"><Filter size={16}/>Filtrar por tipo</div>
     {tipos.map(tipo=><Button key={tipo} type="button" size="sm" variant={tipoFiltro===tipo?"default":"outline"} onClick={()=>setTipoFiltro(tipo)}>{tipo==="TODOS"?"Todos":tipo}</Button>)}
    </div>
    <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={()=>marcarVisibles(true)} disabled={filasFiltradas.length===0}>Marcar visibles</Button><Button type="button" size="sm" variant="outline" onClick={()=>marcarVisibles(false)} disabled={filasFiltradas.length===0}>Desmarcar visibles</Button></div>
   </div>
  </CardContent></Card>

  <Card><CardContent className="p-0"><div className="overflow-x-auto">
   <table className="w-full min-w-[1450px] text-sm"><thead className="border-b bg-slate-50 text-left"><tr>
    <th className="p-3">Tipo</th><th className="p-3">Característica</th><th className="p-3">Criterio FT</th><th className="p-3">Especificación FT</th><th className="p-3">Unidad</th><th className="p-3 text-center">Imprime certificado</th><th className="p-3 text-center">Obligatorio</th><th className="p-3">Orden</th><th className="p-3"></th>
   </tr></thead><tbody>
    {filasFiltradas.map(base=>{const x=valor(base),crit=criterioNombre(x);return <tr key={base.versionFtCaracteristicaId} className="border-b align-top last:border-0">
     <td className="p-3">{x.tipoCaractDescripcion}</td><td className="p-3 font-semibold">{x.caracteristicaDescripcion}</td>
     <td className="p-3"><select className="h-9 min-w-36 rounded-md border bg-white px-2" value={x.tipoCriterioId} onChange={e=>cambiarCriterio(base,Number(e.target.value))}>{(cats.data?.tiposCriterio??[]).map(t=><option key={t.tipoCriterioId} value={t.tipoCriterioId}>{t.tipoCriterio}</option>)}</select></td>
     <td className="p-3">{crit==="RANGO"?<div className="flex items-center gap-2"><Input className="w-28" type="number" step="any" value={x.valorCuantitativoInicial??""} onChange={e=>patch(base,{valorCuantitativoInicial:numero(e.target.value)})}/><span>–</span><Input className="w-28" type="number" step="any" value={x.valorCuantitativoFinal??""} onChange={e=>patch(base,{valorCuantitativoFinal:numero(e.target.value)})}/></div>:crit==="CUALITATIVO"||crit==="AUSENCIA"?<Input className="min-w-52" value={x.valorCualitativo??""} onChange={e=>patch(base,{valorCualitativo:e.target.value||null})}/>:<Input className="w-32" type="number" step="any" value={x.valorCuantitativoIgual??x.valorCuantitativoInicial??""} onChange={e=>{const v=numero(e.target.value);if(crit==="IGUAL")patch(base,{valorCuantitativoIgual:v,valorCuantitativoInicial:null,valorCuantitativoFinal:null});else patch(base,{valorCuantitativoInicial:v,valorCuantitativoIgual:null,valorCuantitativoFinal:null})}}/>}</td>
     <td className="p-3"><Input className="w-28" value={x.unidadDeMedida??""} onChange={e=>patch(base,{unidadDeMedida:e.target.value||null})}/></td>
     <td className="p-3 text-center"><input type="checkbox" checked={x.imprimeCertificado} onChange={e=>patch(base,{imprimeCertificado:e.target.checked,obligatorioCertificado:e.target.checked?x.obligatorioCertificado:false,ordenCertificado:e.target.checked?(x.ordenCertificado??1):null})}/></td>
     <td className="p-3 text-center"><input type="checkbox" disabled={!x.imprimeCertificado} checked={x.obligatorioCertificado} onChange={e=>patch(base,{obligatorioCertificado:e.target.checked})}/></td>
     <td className="p-3"><Input className="w-20" type="number" min={1} disabled={!x.imprimeCertificado} value={x.ordenCertificado??""} onChange={e=>patch(base,{ordenCertificado:e.target.value?Number(e.target.value):null})}/></td>
     <td className="p-3"><Button size="sm" disabled={!editando[base.versionFtCaracteristicaId]||guardar.isPending} onClick={()=>guardar.mutate(x)}><Save/>Guardar</Button></td>
    </tr>})}
    {filasFiltradas.length===0&&<tr><td colSpan={9} className="p-8 text-center text-sm text-[var(--text-secondary)]">No hay características para el tipo seleccionado.</td></tr>}
   </tbody></table>
  </div>{(guardar.isSuccess||guardarSeccion.isSuccess)&&<div className="flex items-center gap-2 border-t p-3 text-sm text-emerald-700"><Check size={16}/>Configuración FT actualizada.</div>}</CardContent></Card>
 </PageContainer>
}
