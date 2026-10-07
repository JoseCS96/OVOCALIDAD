import {useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowLeft,Check,ChevronDown,ChevronUp,Filter,Plus,Save,Trash2} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {obtenerCatalogosEt} from "@/modules/especificaciones/api";
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
 const cats=useQuery({queryKey:["catalogos-et"],queryFn:obtenerCatalogosEt});

 const [editando,setEditando]=useState<Record<number,CaracteristicaFt>>({});
 const [tipoFiltro,setTipoFiltro]=useState("TODOS");
 const [seccionesEditadas,setSeccionesEditadas]=useState<Record<number,SeccionFt>>({});
 const [nuevaSeccion,setNuevaSeccion]=useState({titulo:"",tipoContenido:"TEXTO" as "TEXTO"|"LISTA"|"TABLA"});

 const filas=useMemo(()=>[...(chars.data??[])].sort((a,b)=>(a.versionFaseOrden??9999)-(b.versionFaseOrden??9999)||(a.ordenTecnico??9999)-(b.ordenTecnico??9999)||a.versionFtCaracteristicaId-b.versionFtCaracteristicaId),[chars.data]);
 const filasSecciones=useMemo(()=>[...(secciones.data??[])].sort((a,b)=>(a.orden??9999)-(b.orden??9999)),[secciones.data]);
 const tipos=useMemo(()=>{
  const valores=filas.map(x=>x.tipoCaractDescripcion?.trim()).filter((x):x is string=>!!x);
  return ["TODOS",...Array.from(new Set(valores)).sort((a,b)=>a.localeCompare(b))];
 },[filas]);
 const filasFiltradas=useMemo(()=>tipoFiltro==="TODOS"?filas:filas.filter(x=>x.tipoCaractDescripcion===tipoFiltro),[filas,tipoFiltro]);


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
  mutationFn:(x:SeccionFt)=>guardarContenidoSeccionFt(id,x.versionFtSeccionId,{titulo:x.titulo,contenido:x.contenido,visible:x.visible}),
  onSuccess:(_,x)=>{
   setSeccionesEditadas(a=>{const n={...a};delete n[x.versionFtSeccionId];return n});
   qc.invalidateQueries({queryKey:["ft-secciones",id]});
  }
 });

 const agregarSeccion=useMutation({
  mutationFn:()=>agregarSeccionFt(id,{titulo:nuevaSeccion.titulo.trim(),tipoContenido:nuevaSeccion.tipoContenido,orden:null}),
  onSuccess:()=>{setNuevaSeccion({titulo:"",tipoContenido:"TEXTO"});qc.invalidateQueries({queryKey:["ft-secciones",id]})}
 });

 const quitarSeccion=useMutation({
  mutationFn:(versionFtSeccionId:number)=>quitarSeccionFt(id,versionFtSeccionId),
  onSuccess:()=>qc.invalidateQueries({queryKey:["ft-secciones",id]})
 });

 const moverSeccion=useMutation({
  mutationFn:async({versionFtSeccionId,direccion}:{versionFtSeccionId:number;direccion:-1|1})=>{
   const arr=[...filasSecciones];
   const i=arr.findIndex(x=>x.versionFtSeccionId===versionFtSeccionId),j=i+direccion;
   if(i<0||j<0||j>=arr.length)return;
   [arr[i],arr[j]]=[arr[j],arr[i]];
   await reordenarSeccionesFt(id,{secciones:arr.map((x,k)=>({versionFtSeccionId:x.versionFtSeccionId,orden:k+1}))});
  },
  onSuccess:()=>qc.invalidateQueries({queryKey:["ft-secciones",id]})
 });

 const seccionValor=(x:SeccionFt)=>seccionesEditadas[x.versionFtSeccionId]??x;
 const patchSeccion=(x:SeccionFt,p:Partial<SeccionFt>)=>setSeccionesEditadas(a=>({...a,[x.versionFtSeccionId]:{...seccionValor(x),...p}}));

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
    <label className="min-w-72 flex-1 space-y-1">
     <span className="text-sm font-medium">Agregar sección adicional de FT</span>
     <Input value={nuevaSeccion.titulo} onChange={e=>setNuevaSeccion(v=>({...v,titulo:e.target.value}))} placeholder="Ej. Información nutricional complementaria"/>
    </label>
    <label className="space-y-1">
     <span className="text-sm font-medium">Tipo</span>
     <select className="h-10 rounded-md border bg-white px-3 text-sm" value={nuevaSeccion.tipoContenido} onChange={e=>setNuevaSeccion(v=>({...v,tipoContenido:e.target.value as "TEXTO"|"LISTA"|"TABLA"}))}>
      <option value="TEXTO">Texto</option><option value="LISTA">Lista</option><option value="TABLA">Tabla</option>
     </select>
    </label>
    <Button type="button" disabled={!nuevaSeccion.titulo.trim()||agregarSeccion.isPending} onClick={()=>agregarSeccion.mutate()}><Plus/>Agregar</Button>
   </div>

   <div className="grid gap-3">
    {filasSecciones.map((base,index)=>{
     const s=seccionValor(base);
     const cambiado=!!seccionesEditadas[base.versionFtSeccionId];
     return <div key={base.versionFtSeccionId} className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
       <div className="flex-1">
        <div className="flex items-center gap-2">
         <span className="text-xs font-semibold text-[var(--text-secondary)]">{index+1}</span>
         <Input className="max-w-xl font-semibold" value={s.titulo} onChange={e=>patchSeccion(base,{titulo:e.target.value})}/>
         <span className="rounded-full border px-2 py-1 text-[11px]">{s.tipoContenido}</span>
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{s.esSistema?"Sección base de la Hoja/Ficha Técnica":"Sección adicional"}</p>
       </div>
       <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={s.visible} onChange={e=>patchSeccion(base,{visible:e.target.checked})}/>Visible</label>
        <Button type="button" size="sm" variant="outline" disabled={index===0||moverSeccion.isPending} onClick={()=>moverSeccion.mutate({versionFtSeccionId:s.versionFtSeccionId,direccion:-1})}><ChevronUp/></Button>
        <Button type="button" size="sm" variant="outline" disabled={index===filasSecciones.length-1||moverSeccion.isPending} onClick={()=>moverSeccion.mutate({versionFtSeccionId:s.versionFtSeccionId,direccion:1})}><ChevronDown/></Button>
        {!s.esSistema&&<Button type="button" size="sm" variant="outline" className="text-red-600" disabled={quitarSeccion.isPending} onClick={()=>{if(window.confirm(`¿Retirar la sección "${s.titulo}" de esta FT?`))quitarSeccion.mutate(s.versionFtSeccionId)}}><Trash2/>Quitar</Button>}
       </div>
      </div>

      {s.tipoContenido==="CARACTERISTICAS"
       ?<div className="rounded-md bg-slate-50 p-3 text-sm text-[var(--text-secondary)]">Esta sección se genera automáticamente con las características configuradas de la FT. Los criterios y valores se editan en el bloque de características de abajo.</div>
       :<textarea className="min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm" value={s.contenido??""} onChange={e=>patchSeccion(base,{contenido:e.target.value})} placeholder={s.tipoContenido==="TABLA"?"Contenido de tabla / filas de la sección...":s.tipoContenido==="LISTA"?"Un elemento por línea...":"Contenido de la sección..."}/>}
      <div className="mt-2 flex justify-end"><Button type="button" size="sm" disabled={!cambiado||guardarSeccion.isPending} onClick={()=>guardarSeccion.mutate(s)}><Save/>Guardar sección</Button></div>
     </div>
    })}
    {!filasSecciones.length&&<div className="rounded-lg border border-dashed p-6 text-center text-sm text-[var(--text-secondary)]">No se encontraron secciones de FT. Verifica que la migración de diseño propio esté ejecutada.</div>}
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
     <td className="p-3">{x.tipoCaractDescripcion}</td><td className="p-3 font-semibold">{x.caracteristicaDescripcion}<div className="mt-0.5 text-xs font-normal text-[var(--text-secondary)]">Orden técnico {x.ordenTecnico??"—"} · {x.faseCodigo??"Sin fase"}</div></td>
     <td className="p-3"><select className="h-9 min-w-36 rounded-md border bg-white px-2" value={x.tipoCriterioId} onChange={e=>cambiarCriterio(base,Number(e.target.value))}>{(cats.data?.tiposCriterio??[]).map(t=><option key={t.tipoCriterioId} value={t.tipoCriterioId}>{t.tipoCriterio}</option>)}</select></td>
     <td className="p-3">{crit==="RANGO"?<div className="flex items-center gap-2"><Input className="w-28" type="number" step="any" value={x.valorCuantitativoInicial??""} onChange={e=>patch(base,{valorCuantitativoInicial:numero(e.target.value)})}/><span>–</span><Input className="w-28" type="number" step="any" value={x.valorCuantitativoFinal??""} onChange={e=>patch(base,{valorCuantitativoFinal:numero(e.target.value)})}/></div>:crit==="CUALITATIVO"||crit==="AUSENCIA"?<Input className="min-w-52" value={x.valorCualitativo??""} onChange={e=>patch(base,{valorCualitativo:e.target.value||null})}/>:<Input className="w-32" type="number" step="any" value={crit==="IGUAL"?(x.valorCuantitativoIgual??""):(crit==="MAXIMO"||crit==="MENOR_QUE"?(x.valorCuantitativoFinal??""):(x.valorCuantitativoInicial??""))} onChange={e=>{const v=numero(e.target.value);if(crit==="IGUAL")patch(base,{valorCuantitativoIgual:v,valorCuantitativoInicial:null,valorCuantitativoFinal:null});else if(crit==="MAXIMO"||crit==="MENOR_QUE")patch(base,{valorCuantitativoFinal:v,valorCuantitativoInicial:null,valorCuantitativoIgual:null});else patch(base,{valorCuantitativoInicial:v,valorCuantitativoFinal:null,valorCuantitativoIgual:null})}}/>}</td>
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
