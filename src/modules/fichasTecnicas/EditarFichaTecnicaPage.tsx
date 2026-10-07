import {useEffect,useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowLeft,Check,Filter,Plus,Save,X} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {obtenerCatalogosEt} from "@/modules/especificaciones/api";
import EstructuraFtPanel from "./components/EstructuraFtPanel";
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
 const [seccionActiva,setSeccionActiva]=useState<number|null>(null);
 const [modalAgregar,setModalAgregar]=useState(false);
 const [nuevaSeccion,setNuevaSeccion]=useState({titulo:"",tipoContenido:"TEXTO" as "TEXTO"|"LISTA"|"TABLA"});

 const filas=useMemo(()=>[...(chars.data??[])].sort((a,b)=>(a.versionFaseOrden??9999)-(b.versionFaseOrden??9999)||(a.ordenTecnico??9999)-(b.ordenTecnico??9999)||a.versionFtCaracteristicaId-b.versionFtCaracteristicaId),[chars.data]);
 const filasSecciones=useMemo(()=>[...(secciones.data??[])].sort((a,b)=>(a.orden??9999)-(b.orden??9999)),[secciones.data]);
 const tipos=useMemo(()=>{
  const valores=filas.map(x=>x.tipoCaractDescripcion?.trim()).filter((x):x is string=>!!x);
  return ["TODOS",...Array.from(new Set(valores)).sort((a,b)=>a.localeCompare(b))];
 },[filas]);
 const filasFiltradas=useMemo(()=>tipoFiltro==="TODOS"?filas:filas.filter(x=>x.tipoCaractDescripcion===tipoFiltro),[filas,tipoFiltro]);

 useEffect(()=>{
  if(!filasSecciones.length){setSeccionActiva(null);return}
  if(!seccionActiva||!filasSecciones.some(x=>x.versionFtSeccionId===seccionActiva))setSeccionActiva(filasSecciones[0].versionFtSeccionId);
 },[filasSecciones,seccionActiva]);

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
  onSuccess:()=>{setNuevaSeccion({titulo:"",tipoContenido:"TEXTO"});setModalAgregar(false);qc.invalidateQueries({queryKey:["ft-secciones",id]})}
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
  const nuevo={...actual};filasFiltradas.forEach(base=>{const x=actual[base.versionFtCaracteristicaId]??base;nuevo[base.versionFtCaracteristicaId]={...x,imprimeCertificado:marcar,obligatorioCertificado:marcar?x.obligatorioCertificado:false,ordenCertificado:marcar?(x.ordenCertificado??x.ordenTecnico??1):null}});return nuevo;
 });

 if(ft.isLoading||chars.isLoading||secciones.isLoading||cats.isLoading)return <PageContainer><div className="py-16 text-center">Cargando Ficha Técnica...</div></PageContainer>;
 if(ft.isError||chars.isError||secciones.isError||!ft.data)return <PageContainer><div className="py-16 text-center text-red-600">No se pudo cargar la Ficha Técnica.</div></PageContainer>;

 const activaBase=filasSecciones.find(x=>x.versionFtSeccionId===seccionActiva)??filasSecciones[0];
 const activa=activaBase?seccionValor(activaBase):undefined;
 const busy=moverSeccion.isPending||quitarSeccion.isPending||agregarSeccion.isPending||guardarSeccion.isPending;
 const esCaracteristicas=activa?.tipoContenido==="CARACTERISTICAS"||activa?.codigo==="CARACTERISTICAS";

 return <PageContainer className="space-y-5">
  <div className="flex items-start justify-between gap-4">
   <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental · Ficha técnica</p>
    <h1 className="mt-1 text-2xl font-semibold">{ft.data.productoCodigo} · {ft.data.documentoCodigo}</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{ft.data.documentoDescripcionDocumento} · v{ft.data.versionNumero} · {ft.data.estadoVersion}</p>
   </div>
   <Button variant="outline" onClick={()=>nav("/documentos/fichas-tecnicas")}><ArrowLeft/>Volver</Button>
  </div>

  <Card><CardContent className="p-5">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div><h2 className="font-semibold">Contenido de la Ficha Técnica</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Selecciona una sección en la estructura para editar su contenido. La FT mantiene contenido propio e independiente de la ET.</p></div>
    <div className="text-right"><p className="text-xs text-[var(--text-secondary)]">Versión</p><p className="font-semibold">{ft.data.versionNumero??"—"}</p></div>
   </div>
  </CardContent></Card>

  <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
   <EstructuraFtPanel
    estructura={filasSecciones}
    activa={activa}
    busy={busy}
    onSeleccionar={setSeccionActiva}
    onAgregar={()=>setModalAgregar(true)}
    onMover={(s,dir)=>moverSeccion.mutate({versionFtSeccionId:s.versionFtSeccionId,direccion:dir})}
    onQuitar={s=>{if(window.confirm(`¿Retirar la sección "${s.titulo}" de esta FT?`))quitarSeccion.mutate(s.versionFtSeccionId)}}
   />

   <div className="min-w-0">
    {!activa?<Card><CardContent className="p-8 text-center text-sm text-[var(--text-secondary)]">No se encontraron secciones para esta FT.</CardContent></Card>
    :esCaracteristicas?<CaracteristicasPanel
      filas={filas}
      filasFiltradas={filasFiltradas}
      tipos={tipos}
      tipoFiltro={tipoFiltro}
      setTipoFiltro={setTipoFiltro}
      cats={cats.data}
      valor={valor}
      patch={patch}
      criterioNombre={criterioNombre}
      cambiarCriterio={cambiarCriterio}
      marcarVisibles={marcarVisibles}
      guardar={guardar}
      editando={editando}
     />
    :<Card><CardContent className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
       <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">{activa.tipoContenido}</p>
        <Input className="mt-2 max-w-2xl text-base font-semibold" value={activa.titulo} onChange={e=>patchSeccion(activaBase,{titulo:e.target.value})}/>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{activa.esSistema?"Sección base de la Ficha Técnica":"Sección adicional"}</p>
       </div>
       <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={activa.visible} onChange={e=>patchSeccion(activaBase,{visible:e.target.checked})}/>Visible</label>
      </div>

      <textarea
       className="min-h-[360px] w-full resize-y rounded-lg border bg-white p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-slate-200"
       value={activa.contenido??""}
       onChange={e=>patchSeccion(activaBase,{contenido:e.target.value})}
       placeholder={activa.tipoContenido==="TABLA"?"Contenido de tabla / filas de la sección...":activa.tipoContenido==="LISTA"?"Un elemento por línea...":"Contenido de la sección..."}
      />

      <div className="flex justify-end border-t pt-4">
       <Button disabled={!seccionesEditadas[activa.versionFtSeccionId]||guardarSeccion.isPending} onClick={()=>guardarSeccion.mutate(activa)}><Save/>{guardarSeccion.isPending?"Guardando...":"Guardar sección"}</Button>
      </div>
     </CardContent></Card>}
   </div>
  </div>

  {modalAgregar&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
   <Card className="w-full max-w-lg bg-white"><CardContent className="space-y-4 p-5">
    <div className="flex items-start justify-between"><div><h3 className="text-lg font-semibold">Agregar sección</h3><p className="text-sm text-[var(--text-secondary)]">Crea una sección adicional propia de esta FT.</p></div><Button variant="ghost" size="icon" onClick={()=>setModalAgregar(false)}><X/></Button></div>
    <label className="block space-y-1.5"><span className="text-sm font-medium">Título</span><Input value={nuevaSeccion.titulo} onChange={e=>setNuevaSeccion(v=>({...v,titulo:e.target.value}))} placeholder="Ej. Información nutricional complementaria"/></label>
    <label className="block space-y-1.5"><span className="text-sm font-medium">Tipo</span><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={nuevaSeccion.tipoContenido} onChange={e=>setNuevaSeccion(v=>({...v,tipoContenido:e.target.value as "TEXTO"|"LISTA"|"TABLA"}))}><option value="TEXTO">Texto</option><option value="LISTA">Lista</option><option value="TABLA">Tabla</option></select></label>
    <div className="flex justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={()=>setModalAgregar(false)}>Cancelar</Button><Button disabled={!nuevaSeccion.titulo.trim()||agregarSeccion.isPending} onClick={()=>agregarSeccion.mutate()}><Plus/>{agregarSeccion.isPending?"Agregando...":"Agregar sección"}</Button></div>
   </CardContent></Card>
  </div>}
 </PageContainer>
}

function CaracteristicasPanel({filas,filasFiltradas,tipos,tipoFiltro,setTipoFiltro,cats,valor,patch,criterioNombre,cambiarCriterio,marcarVisibles,guardar,editando}:{
 filas:CaracteristicaFt[];
 filasFiltradas:CaracteristicaFt[];
 tipos:string[];
 tipoFiltro:string;
 setTipoFiltro:(v:string)=>void;
 cats:any;
 valor:(x:CaracteristicaFt)=>CaracteristicaFt;
 patch:(x:CaracteristicaFt,p:Partial<CaracteristicaFt>)=>void;
 criterioNombre:(x:CaracteristicaFt)=>string;
 cambiarCriterio:(x:CaracteristicaFt,id:number)=>void;
 marcarVisibles:(v:boolean)=>void;
 guardar:any;
 editando:Record<number,CaracteristicaFt>;
}){
 return <div className="space-y-4">
  <Card><CardContent className="p-5"><h2 className="font-semibold">Características de la Ficha Técnica</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{filas.length} características heredadas de la ET. Los valores de la FT son independientes y determinan qué parámetros pueden imprimirse en certificado.</p></CardContent></Card>

  <Card><CardContent className="space-y-4 p-4">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-2 text-sm font-medium"><Filter size={16}/>Filtrar por tipo</div>{tipos.map(tipo=><Button key={tipo} type="button" size="sm" variant={tipoFiltro===tipo?"default":"outline"} onClick={()=>setTipoFiltro(tipo)}>{tipo==="TODOS"?"Todos":tipo}</Button>)}</div>
    <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={()=>marcarVisibles(true)} disabled={filasFiltradas.length===0}>Marcar visibles</Button><Button type="button" size="sm" variant="outline" onClick={()=>marcarVisibles(false)} disabled={filasFiltradas.length===0}>Desmarcar visibles</Button></div>
   </div>
  </CardContent></Card>

  <Card><CardContent className="p-0"><div className="overflow-x-auto">
   <table className="w-full min-w-[1250px] text-sm"><thead className="border-b bg-slate-50 text-left"><tr>
    <th className="p-3">Tipo</th><th className="p-3">Característica</th><th className="p-3">Criterio FT</th><th className="p-3">Especificación FT</th><th className="p-3">Unidad</th><th className="p-3 text-center">Imprime certificado</th><th className="p-3 text-center">Obligatorio</th><th className="p-3">Orden</th><th className="p-3"></th>
   </tr></thead><tbody>
    {filasFiltradas.map(base=>{const x=valor(base),crit=criterioNombre(x);return <tr key={base.versionFtCaracteristicaId} className="border-b align-top last:border-0">
     <td className="p-3">{x.tipoCaractDescripcion}</td>
     <td className="p-3 font-semibold">{x.caracteristicaDescripcion}<div className="mt-0.5 text-xs font-normal text-[var(--text-secondary)]">Orden técnico {x.ordenTecnico??"—"} · {x.faseCodigo??"Sin fase"}</div></td>
     <td className="p-3"><select className="h-9 min-w-36 rounded-md border bg-white px-2" value={x.tipoCriterioId} onChange={e=>cambiarCriterio(base,Number(e.target.value))}>{(cats?.tiposCriterio??[]).map((t:any)=><option key={t.tipoCriterioId} value={t.tipoCriterioId}>{t.tipoCriterio}</option>)}</select></td>
     <td className="p-3">{crit==="RANGO"?<div className="flex items-center gap-2"><Input className="w-28" type="number" step="any" value={x.valorCuantitativoInicial??""} onChange={e=>patch(base,{valorCuantitativoInicial:numero(e.target.value)})}/><span>–</span><Input className="w-28" type="number" step="any" value={x.valorCuantitativoFinal??""} onChange={e=>patch(base,{valorCuantitativoFinal:numero(e.target.value)})}/></div>:crit==="CUALITATIVO"||crit==="AUSENCIA"?<Input className="min-w-52" value={x.valorCualitativo??""} onChange={e=>patch(base,{valorCualitativo:e.target.value||null})}/>:<Input className="w-32" type="number" step="any" value={crit==="IGUAL"?(x.valorCuantitativoIgual??""):(crit==="MAXIMO"||crit==="MENOR_QUE"?(x.valorCuantitativoFinal??""):(x.valorCuantitativoInicial??""))} onChange={e=>{const v=numero(e.target.value);if(crit==="IGUAL")patch(base,{valorCuantitativoIgual:v,valorCuantitativoInicial:null,valorCuantitativoFinal:null});else if(crit==="MAXIMO"||crit==="MENOR_QUE")patch(base,{valorCuantitativoFinal:v,valorCuantitativoInicial:null,valorCuantitativoIgual:null});else patch(base,{valorCuantitativoInicial:v,valorCuantitativoFinal:null,valorCuantitativoIgual:null})}}/>}</td>
     <td className="p-3"><Input className="w-28" value={x.unidadDeMedida??""} onChange={e=>patch(base,{unidadDeMedida:e.target.value||null})}/></td>
     <td className="p-3 text-center"><input type="checkbox" checked={x.imprimeCertificado} onChange={e=>patch(base,{imprimeCertificado:e.target.checked,obligatorioCertificado:e.target.checked?x.obligatorioCertificado:false,ordenCertificado:e.target.checked?(x.ordenCertificado??x.ordenTecnico??1):null})}/></td>
     <td className="p-3 text-center"><input type="checkbox" disabled={!x.imprimeCertificado} checked={x.obligatorioCertificado} onChange={e=>patch(base,{obligatorioCertificado:e.target.checked})}/></td>
     <td className="p-3"><Input className="w-20" type="number" min={1} disabled={!x.imprimeCertificado} value={x.ordenCertificado??""} onChange={e=>patch(base,{ordenCertificado:e.target.value?Number(e.target.value):null})}/></td>
     <td className="p-3"><Button size="sm" disabled={!editando[base.versionFtCaracteristicaId]||guardar.isPending} onClick={()=>guardar.mutate(x)}><Save/>Guardar</Button></td>
    </tr>})}
    {filasFiltradas.length===0&&<tr><td colSpan={9} className="p-8 text-center text-sm text-[var(--text-secondary)]">No hay características para el tipo seleccionado.</td></tr>}
   </tbody></table>
  </div>{guardar.isSuccess&&<div className="flex items-center gap-2 border-t p-3 text-sm text-emerald-700"><Check size={16}/>Configuración FT actualizada.</div>}</CardContent></Card>
 </div>
}
