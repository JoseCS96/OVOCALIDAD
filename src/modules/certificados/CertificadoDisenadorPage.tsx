import {useEffect,useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowDown,ArrowLeft,ArrowUp,Building2,Check,ChevronRight,FileText,Layers3,Plus,Save,Trash2} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {guardarDiseno,obtenerEmpresaCertificado,obtenerPlantilla,parametrosFt} from "./api";
import type {ParametroFt,SeccionDiseno} from "./types";

const catalogo=[
 ["ENCABEZADO","Título y subtítulo"],
 ["DATOS_EMPRESA","Datos de empresa"],
 ["PRODUCTO","Ovoproducto"],
 ["DATOS_LOTE","Datos del lote"],
 ["RESULTADOS","Resultados y evaluaciones"],
 ["ALMACENAMIENTO","Condición y almacenamiento"],
 ["REFERENCIAS","Referencias"],
 ["FIRMA","Firmas y fecha"],
 ["PIE","Pie de página"],
] as const;

const nuevaSeccion=(tipoSeccion:string,titulo:string,orden:number):SeccionDiseno=>({
 tipoSeccion,
 titulo,
 contenido:tipoSeccion==="ENCABEZADO"?"CERTIFICADO DE ANÁLISIS":null,
 orden,
 visible:true,
 modoSeleccion:"MANUAL",
 versionFaseId:null,
 tipoCaractId:null,
 caracteristicas:[]
});

export default function CertificadoDisenadorPage(){
 const {id}=useParams(),plantillaId=Number(id),nav=useNavigate(),qc=useQueryClient();
 const plantilla=useQuery({queryKey:["plantilla-certificado",plantillaId],queryFn:()=>obtenerPlantilla(plantillaId),enabled:Number.isFinite(plantillaId)});
 const parametros=useQuery({queryKey:["parametros-certificado-ft",plantilla.data?.versionFtId],queryFn:()=>parametrosFt(plantilla.data!.versionFtId),enabled:!!plantilla.data?.versionFtId});
 const empresa=useQuery({queryKey:["certificado-empresa"],queryFn:obtenerEmpresaCertificado});
 const [secciones,setSecciones]=useState<SeccionDiseno[]>([]);
 const [seleccion,setSeleccion]=useState(0);

 useEffect(()=>{
  if(!plantilla.data)return;
  const items=[...plantilla.data.secciones].sort((a,b)=>a.orden-b.orden).map(s=>({
   tipoSeccion:s.tipoSeccion,
   titulo:s.titulo??"",
   contenido:s.contenido??null,
   orden:s.orden,
   visible:s.visible,
   modoSeleccion:s.modoSeleccion??"MANUAL",
   versionFaseId:s.versionFaseId??null,
   tipoCaractId:s.tipoCaractId??null,
   caracteristicas:plantilla.data!.caracteristicas
    .filter(c=>c.certificadoPlantillaSeccionId===s.certificadoPlantillaSeccionId)
    .sort((a,b)=>a.orden-b.orden)
    .map(c=>({versionFtCaracteristicaId:c.versionFtCaracteristicaId,orden:c.orden}))
  })) as SeccionDiseno[];
  setSecciones(items);
  setSeleccion(items.length?0:-1);
 },[plantilla.data]);

 const normalizar=(items:SeccionDiseno[])=>items.map((s,i)=>({...s,orden:i+1,caracteristicas:s.caracteristicas.map((c,j)=>({...c,orden:j+1}))}));
 const actual=seleccion>=0?secciones[seleccion]:undefined;
 const ocupados=useMemo(()=>new Set(secciones.flatMap((s,i)=>i===seleccion?[]:s.caracteristicas.map(c=>c.versionFtCaracteristicaId))),[secciones,seleccion]);

 const tipos=useMemo(()=>Array.from(new Map((parametros.data??[]).filter(x=>x.tipoCaractId!=null).map(x=>[x.tipoCaractId as number,x.tipoCaractDescripcion??"Sin tipo"] as const)).entries()),[parametros.data]);
 const fases=useMemo(()=>Array.from(new Map((parametros.data??[]).filter(x=>x.versionFaseId!=null).map(x=>[x.versionFaseId as number,x.faseDescripcion||x.faseCodigo||"Sin fase"] as const)).entries()),[parametros.data]);

 const compatibles=(p:ParametroFt,s:SeccionDiseno)=>{
  if(s.modoSeleccion==="TIPO")return p.tipoCaractId===s.tipoCaractId;
  if(s.modoSeleccion==="FASE")return p.versionFaseId===s.versionFaseId;
  if(s.modoSeleccion==="TIPO_FASE")return p.tipoCaractId===s.tipoCaractId&&p.versionFaseId===s.versionFaseId;
  return true;
 };

 const guardar=useMutation({
  mutationFn:()=>guardarDiseno(plantillaId,normalizar(secciones)),
  onSuccess:()=>qc.invalidateQueries({queryKey:["plantilla-certificado",plantillaId]})
 });

 const agregar=(tipo:string,titulo:string)=>{
  setSecciones(a=>{const n=normalizar([...a,nuevaSeccion(tipo,titulo,a.length+1)]);setSeleccion(n.length-1);return n});
 };
 const mover=(i:number,d:number)=>setSecciones(a=>{const j=i+d;if(j<0||j>=a.length)return a;const n=[...a];[n[i],n[j]]=[n[j],n[i]];setSeleccion(j);return normalizar(n)});
 const quitar=(i:number)=>setSecciones(a=>{const n=normalizar(a.filter((_,x)=>x!==i));setSeleccion(n.length?Math.min(i,n.length-1):-1);return n});
 const actualizarActual=(patch:Partial<SeccionDiseno>)=>setSecciones(a=>a.map((s,i)=>i===seleccion?{...s,...patch}:s));

 const alternarParametro=(p:ParametroFt)=>{
  if(!actual||ocupados.has(p.versionFtCaracteristicaId)||!compatibles(p,actual))return;
  const existe=actual.caracteristicas.some(x=>x.versionFtCaracteristicaId===p.versionFtCaracteristicaId);
  const chars=existe
   ?actual.caracteristicas.filter(x=>x.versionFtCaracteristicaId!==p.versionFtCaracteristicaId)
   :[...actual.caracteristicas,{versionFtCaracteristicaId:p.versionFtCaracteristicaId,orden:actual.caracteristicas.length+1}];
  actualizarActual({caracteristicas:chars.map((x,i)=>({...x,orden:i+1}))});
 };

 const metodosSeleccionados=useMemo(()=>{
  const ids=new Set(secciones.flatMap(s=>s.caracteristicas.map(c=>c.versionFtCaracteristicaId)));
  return (parametros.data??[]).filter(p=>ids.has(p.versionFtCaracteristicaId)&&p.metEnsayoDescripcion);
 },[secciones,parametros.data]);

 if(plantilla.isLoading)return <PageContainer>Cargando diseñador...</PageContainer>;
 if(!plantilla.data)return <PageContainer>No se encontró la plantilla.</PageContainer>;

 const renderContenido=()=>{
  if(!actual)return null;

  if(actual.tipoSeccion==="ENCABEZADO")return <Card><CardContent className="space-y-4 p-5">
   <div><h2 className="font-semibold">Título y subtítulo</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Texto que aparecerá en la cabecera del certificado.</p></div>
   <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Título</span><Input value={actual.titulo} onChange={e=>actualizarActual({titulo:e.target.value})}/></label>
   <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Subtítulo</span><Input value={actual.contenido??""} onChange={e=>actualizarActual({contenido:e.target.value})}/></label>
   <div className="rounded-lg border bg-white p-6 text-center"><div className="text-sm font-semibold uppercase tracking-wide">{actual.titulo||"SEGURAMIENTO DE LA CALIDAD"}</div><div className="mt-1 text-xl font-bold">{actual.contenido||"CERTIFICADO DE ANÁLISIS"}</div></div>
  </CardContent></Card>;

  if(actual.tipoSeccion==="DATOS_EMPRESA")return <Card><CardContent className="p-5">
   <div className="flex items-start gap-3"><Building2 className="mt-0.5 size-5 text-slate-500"/><div><h2 className="font-semibold">Datos de empresa</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Información dinámica tomada de la configuración general de certificados.</p></div></div>
   <div className="mt-4 rounded-lg border bg-slate-50 p-4 text-sm">
    <div className="font-semibold">{empresa.data?.razonSocial||"—"}</div>
    <div className="mt-2"><b>D:</b> {empresa.data?.direccion||"—"}</div>
    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1"><span><b>T:</b> {empresa.data?.telefono||"—"}</span><span><b>F:</b> {empresa.data?.fax||"—"}</span><span><b>E:</b> {empresa.data?.correo||"—"}</span><span><b>W:</b> {empresa.data?.sitioWeb||"—"}</span></div>
   </div>
  </CardContent></Card>;

  if(actual.tipoSeccion==="PRODUCTO")return <Card><CardContent className="p-5"><h2 className="font-semibold">Ovoproducto</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Se genera automáticamente desde la Ficha Técnica vigente usada por la plantilla.</p><div className="mt-4 rounded-lg border bg-slate-50 p-4 text-sm"><b>OVOPRODUCTO:</b> {plantilla.data?.productoCodigo||"—"} - {plantilla.data?.documentoDescripcionDocumento||"—"}</div></CardContent></Card>;

  if(actual.tipoSeccion==="DATOS_LOTE")return <Card><CardContent className="p-5"><h2 className="font-semibold">Datos del lote</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Estos valores se completarán al emitir el certificado para un lote real.</p><div className="mt-4 grid gap-3 rounded-lg border bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><b>Fecha Producción:</b> [dinámico]</div><div><b>Fecha Caducidad:</b> [dinámico]</div><div><b>N° Lote:</b> [dinámico]</div><div><b>Vida Útil:</b> [dinámico FT]</div></div></CardContent></Card>;

  if(actual.tipoSeccion==="ALMACENAMIENTO")return <Card><CardContent className="p-5"><h2 className="font-semibold">Condición y almacenamiento</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">El texto se obtendrá de la Ficha Técnica vigente. No se duplicará información en la plantilla.</p></CardContent></Card>;

  if(actual.tipoSeccion==="REFERENCIAS")return <Card><CardContent className="p-5"><h2 className="font-semibold">Referencias</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Se construyen a partir de los métodos de ensayo de las características seleccionadas en los bloques de resultados.</p><div className="mt-4 space-y-2 rounded-lg border bg-slate-50 p-4 text-sm">{metodosSeleccionados.length?metodosSeleccionados.map(p=><div key={p.versionFtCaracteristicaId}><b>{p.determinacion}:</b> {p.metEnsayoDescripcion}</div>):<span className="text-[var(--text-secondary)]">Selecciona características en los bloques de resultados para visualizar sus referencias.</span>}</div></CardContent></Card>;

  if(actual.tipoSeccion==="FIRMA")return <Card><CardContent className="p-5"><h2 className="font-semibold">Firmas y fecha</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">La emisión completará responsable, cargo y fecha de forma dinámica.</p><div className="mt-4 rounded-lg border bg-slate-50 p-4 text-sm"><div>[Responsable]</div><div>[Cargo]</div><div>[Fecha de emisión]</div></div></CardContent></Card>;

  if(actual.tipoSeccion==="PIE")return <Card><CardContent className="p-5"><h2 className="font-semibold">Pie de página</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Sección opcional para información adicional del documento.</p><textarea className="mt-4 min-h-28 w-full rounded-md border bg-background p-3 text-sm" value={actual.contenido??""} onChange={e=>actualizarActual({contenido:e.target.value})}/></CardContent></Card>;

  return null;
 };

 return <PageContainer className="space-y-5">
  <div className="flex items-start justify-between gap-4">
   <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Certificación · Diseñador</p><h1 className="mt-1 text-2xl font-semibold">{plantilla.data.nombre}</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">{plantilla.data.productoCodigo??"—"} · {plantilla.data.documentoCodigo} · FT v{plantilla.data.versionNumero}</p></div>
   <div className="flex gap-2"><Button variant="outline" onClick={()=>nav("/certificacion/certificados")}><ArrowLeft/>Volver</Button><Button disabled={!secciones.length||guardar.isPending} onClick={()=>guardar.mutate()}><Save/>{guardar.isPending?"Guardando...":"Guardar diseño"}</Button></div>
  </div>

  <div className="grid min-h-[680px] gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
   <Card className="h-fit xl:sticky xl:top-4"><CardContent className="p-3">
    <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-sm font-semibold">Estructura</p><p className="text-xs text-[var(--text-secondary)]">{secciones.length} secciones</p></div><Layers3 className="size-5 text-slate-400"/></div>
    <div className="space-y-1">{secciones.map((s,i)=><button key={i} type="button" onClick={()=>setSeleccion(i)} className={"flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition "+(seleccion===i?"border-slate-400 bg-slate-100":"border-transparent hover:bg-slate-50")}><span className="w-6 text-xs font-semibold text-slate-400">{String(i+1).padStart(2,"0")}</span><span className="min-w-0 flex-1 truncate">{s.titulo||s.tipoSeccion}</span>{s.tipoSeccion==="RESULTADOS"&&<span className="rounded bg-slate-200 px-1.5 py-.5 text-[10px] font-semibold">{s.caracteristicas.length}</span>}<ChevronRight className="size-4 text-slate-400"/></button>)}</div>
    <div className="mt-4 border-t pt-3"><p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Agregar</p><div className="space-y-1">{catalogo.map(([t,n])=>{const singleton=t!=="RESULTADOS";const existe=singleton&&secciones.some(s=>s.tipoSeccion===t);return <Button key={t} variant="ghost" size="sm" className="w-full justify-start" disabled={existe} onClick={()=>agregar(t,n)}><Plus/>{n}</Button>})}</div></div>
   </CardContent></Card>

   {!actual?<Card><CardContent className="p-10 text-center text-sm text-[var(--text-secondary)]"><FileText className="mx-auto mb-3 size-8 opacity-40"/>Agrega o selecciona una sección para comenzar a diseñar el certificado.</CardContent></Card>:
   <div className="space-y-4">
    <Card><CardContent className="p-5"><div className="flex flex-wrap items-center gap-2"><Input className="min-w-[280px] flex-1 text-base font-semibold" value={actual.titulo} onChange={e=>actualizarActual({titulo:e.target.value})}/><Button variant="outline" size="sm" onClick={()=>mover(seleccion,-1)} disabled={seleccion===0}><ArrowUp/>Subir</Button><Button variant="outline" size="sm" onClick={()=>mover(seleccion,1)} disabled={seleccion===secciones.length-1}><ArrowDown/>Bajar</Button><Button variant="outline" size="sm" onClick={()=>quitar(seleccion)}><Trash2/>Quitar</Button></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={actual.visible} onChange={e=>actualizarActual({visible:e.target.checked})}/>Visible en certificado</label></CardContent></Card>

    {actual.tipoSeccion==="RESULTADOS"?<Card><CardContent className="space-y-5 p-5">
     <div><h2 className="font-semibold">Configuración del bloque de resultados</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Puedes agregar 1, 2, 3 o N bloques para unir análisis y fases dentro de un solo certificado.</p></div>
     <div className="grid gap-3 md:grid-cols-3">
      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Modo de selección</label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={actual.modoSeleccion} onChange={e=>actualizarActual({modoSeleccion:e.target.value as SeccionDiseno["modoSeleccion"],tipoCaractId:null,versionFaseId:null,caracteristicas:[]})}><option value="MANUAL">Manual</option><option value="TIPO">Por tipo de análisis</option><option value="FASE">Por fase / etapa</option><option value="TIPO_FASE">Tipo + fase</option></select></div>
      {(actual.modoSeleccion==="TIPO"||actual.modoSeleccion==="TIPO_FASE")&&<div><label className="mb-1 block text-xs font-semibold text-slate-600">Tipo de análisis</label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={actual.tipoCaractId??""} onChange={e=>actualizarActual({tipoCaractId:e.target.value?Number(e.target.value):null,caracteristicas:[]})}><option value="">Seleccionar</option>{tipos.map(([id,n])=><option key={id} value={id}>{n}</option>)}</select></div>}
      {(actual.modoSeleccion==="FASE"||actual.modoSeleccion==="TIPO_FASE")&&<div><label className="mb-1 block text-xs font-semibold text-slate-600">Fase / etapa</label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={actual.versionFaseId??""} onChange={e=>actualizarActual({versionFaseId:e.target.value?Number(e.target.value):null,caracteristicas:[]})}><option value="">Seleccionar</option>{fases.map(([id,n])=><option key={id} value={id}>{n}</option>)}</select></div>}
     </div>
     <div><div className="mb-3 flex items-center justify-between"><div><h3 className="font-semibold">Características de la FT</h3><p className="text-sm text-[var(--text-secondary)]">Selecciona qué resultados formarán este bloque.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{actual.caracteristicas.length} seleccionadas</span></div>
      {parametros.isLoading?<p className="text-sm">Cargando parámetros...</p>:<div className="overflow-hidden rounded-lg border"><table className="w-full text-sm"><thead className="bg-slate-50 text-left"><tr><th className="p-3">Usar</th><th className="p-3">Determinación</th><th className="p-3">Tipo</th><th className="p-3">Fase</th><th className="p-3">Unidad</th></tr></thead><tbody>{(parametros.data??[]).map(p=>{const activo=actual.caracteristicas.some(x=>x.versionFtCaracteristicaId===p.versionFtCaracteristicaId),ocupado=ocupados.has(p.versionFtCaracteristicaId),compatible=compatibles(p,actual);return <tr key={p.versionFtCaracteristicaId} className={"border-t "+(!compatible||ocupado?"opacity-40":"")}><td className="p-3"><button type="button" disabled={!compatible||ocupado} onClick={()=>alternarParametro(p)} className={"flex size-7 items-center justify-center rounded border "+(activo?"bg-slate-900 text-white":"bg-white")}>{activo&&<Check className="size-4"/>}</button></td><td className="p-3 font-medium">{p.determinacion}</td><td className="p-3">{p.tipoCaractDescripcion??"—"}</td><td className="p-3">{p.faseDescripcion||p.faseCodigo||"—"}</td><td className="p-3">{p.unidadDeMedida||"—"}</td></tr>})}</tbody></table></div>}
     </div>
    </CardContent></Card>:renderContenido()}
   </div>}
  </div>

  {guardar.isSuccess&&<p className="text-sm text-emerald-700">Diseño guardado correctamente.</p>}
  {guardar.isError&&<p className="text-sm text-red-600">{guardar.error instanceof Error?guardar.error.message:"No se pudo guardar el diseño."}</p>}
 </PageContainer>
}
