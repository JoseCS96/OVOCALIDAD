import {useEffect,useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowDown,ArrowLeft,ArrowUp,Building2,Check,EyeOff,FileText,GripVertical,Layers3,Plus,Save,Trash2} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {guardarDiseno,obtenerEmpresaCertificado,obtenerPlantilla,parametrosFt} from "./api";
import type {ParametroFt,ResultadoDiseno,SeccionDiseno} from "./types";

const normalizarSecciones=(items:SeccionDiseno[])=>items.map((s,i)=>({
 ...s,
 orden:i+1,
 resultados:s.resultados.map((r,j)=>({
  ...r,
  modoSeleccion:"MANUAL" as const,
  versionFaseId:null,
  tipoCaractId:null,
  orden:j+1,
  caracteristicas:r.caracteristicas.map((x,k)=>({...x,orden:k+1}))
 }))
}));

const nuevoResultado=(orden:number):ResultadoDiseno=>({
 titulo:"Informe de ensayo",
 orden,
 visible:true,
 modoSeleccion:"MANUAL",
 versionFaseId:null,
 tipoCaractId:null,
 caracteristicas:[]
});

function leerEncabezado(contenido:string|null){
 try{
  const x=JSON.parse(contenido??"{}") as {titulo?:string;subtitulo?:string};
  return {
   titulo:x.titulo??"ASEGURAMIENTO DE LA CALIDAD",
   subtitulo:x.subtitulo??"CERTIFICADO DE ANÁLISIS"
  };
 }catch{
  return {titulo:"ASEGURAMIENTO DE LA CALIDAD",subtitulo:"CERTIFICADO DE ANÁLISIS"};
 }
}

export default function CertificadoDisenadorPage(){
 const {id}=useParams();
 const plantillaId=Number(id);
 const nav=useNavigate();
 const qc=useQueryClient();

 const plantilla=useQuery({
  queryKey:["plantilla-certificado",plantillaId],
  queryFn:()=>obtenerPlantilla(plantillaId),
  enabled:Number.isFinite(plantillaId)
 });

 const parametros=useQuery({
  queryKey:["parametros-certificado-ft",plantilla.data?.versionFtId],
  queryFn:()=>parametrosFt(plantilla.data!.versionFtId),
  enabled:!!plantilla.data?.versionFtId
 });

 const empresa=useQuery({
  queryKey:["certificado-empresa"],
  queryFn:obtenerEmpresaCertificado
 });

 const [secciones,setSecciones]=useState<SeccionDiseno[]>([]);
 const [seccionSeleccionada,setSeccionSeleccionada]=useState(0);
 const [resultadoSeleccionado,setResultadoSeleccionado]=useState(0);
 const [filtroTipoId,setFiltroTipoId]=useState<number|null>(null);
 const [filtroFaseId,setFiltroFaseId]=useState<number|null>(null);

 useEffect(()=>{
  if(!plantilla.data)return;

  const items=[...plantilla.data.secciones]
   .sort((a,b)=>a.orden-b.orden)
   .map(s=>({
    certificadoSeccionId:s.certificadoSeccionId,
    seccionCodigo:s.seccionCodigo,
    seccionDescripcion:s.seccionDescripcion,
    tipoContenido:s.tipoContenido,
    puedeEliminarse:s.puedeEliminarse,
    permiteReordenar:s.permiteReordenar,
    orden:s.orden,
    visible:s.visible,
    contenido:s.contenido??null,
    resultados:plantilla.data!.resultados
     .filter(r=>r.certificadoPlantillaSeccionId===s.certificadoPlantillaSeccionId)
     .sort((a,b)=>a.orden-b.orden)
     .map(r=>({
      titulo:r.titulo,
      orden:r.orden,
      visible:r.visible,
      modoSeleccion:"MANUAL",
      versionFaseId:null,
      tipoCaractId:null,
      caracteristicas:plantilla.data!.caracteristicas
       .filter(c=>c.certificadoPlantillaResultadoId===r.certificadoPlantillaResultadoId)
       .sort((a,b)=>a.orden-b.orden)
       .map(c=>({
        versionFtCaracteristicaId:c.versionFtCaracteristicaId,
        orden:c.orden
       }))
     }))
   })) as SeccionDiseno[];

  setSecciones(normalizarSecciones(items));
  setSeccionSeleccionada(items.length?0:-1);
  setResultadoSeleccionado(0);
 },[plantilla.data]);

 const actual=seccionSeleccionada>=0?secciones[seccionSeleccionada]:undefined;
 const resultadoActual=actual?.seccionCodigo==="RESULTADOS"
  ?actual.resultados[resultadoSeleccionado]
  :undefined;

 const tipos=useMemo(
  ()=>Array.from(new Map(
   (parametros.data??[])
    .filter(x=>x.tipoCaractId!=null)
    .map(x=>[x.tipoCaractId as number,x.tipoCaractDescripcion??"Sin tipo"] as const)
  ).entries()),
  [parametros.data]
 );

 const fases=useMemo(
  ()=>Array.from(new Map(
   (parametros.data??[])
    .filter(x=>x.versionFaseId!=null)
    .map(x=>[x.versionFaseId as number,x.faseDescripcion||x.faseCodigo||"Sin fase"] as const)
  ).entries()),
  [parametros.data]
 );

 const ocupados=useMemo(()=>{
  const ids=new Set<number>();
  secciones.forEach((s,si)=>s.resultados.forEach((r,ri)=>{
   if(si===seccionSeleccionada&&ri===resultadoSeleccionado)return;
   r.caracteristicas.forEach(c=>ids.add(c.versionFtCaracteristicaId));
  }));
  return ids;
 },[secciones,seccionSeleccionada,resultadoSeleccionado]);


 const guardar=useMutation({
  mutationFn:()=>guardarDiseno(plantillaId,normalizarSecciones(secciones)),
  onSuccess:()=>qc.invalidateQueries({queryKey:["plantilla-certificado",plantillaId]})
 });

 const actualizarSeccion=(patch:Partial<SeccionDiseno>)=>{
  setSecciones(a=>a.map((s,i)=>i===seccionSeleccionada?{...s,...patch}:s));
 };

 const moverSeccion=(direccion:number,indice=seccionSeleccionada)=>{
  setSecciones(a=>{
   const origen=a[indice];
   const j=indice+direccion;
   if(!origen?.permiteReordenar||j<0||j>=a.length)return a;
   const n=[...a];
   [n[indice],n[j]]=[n[j],n[indice]];
   setSeccionSeleccionada(j);
   return normalizarSecciones(n);
  });
 };

 const quitarSeccion=()=>{
  if(!actual?.puedeEliminarse)return;
  setSecciones(a=>{
   const n=normalizarSecciones(a.filter((_,i)=>i!==seccionSeleccionada));
   setSeccionSeleccionada(n.length?Math.min(seccionSeleccionada,n.length-1):-1);
   setResultadoSeleccionado(0);
   return n;
  });
 };

 const actualizarResultado=(patch:Partial<ResultadoDiseno>)=>{
  if(!actual||actual.seccionCodigo!=="RESULTADOS")return;
  actualizarSeccion({
   resultados:actual.resultados.map((r,i)=>i===resultadoSeleccionado?{...r,...patch}:r)
  });
 };

 const agregarResultado=()=>{
  if(!actual||actual.seccionCodigo!=="RESULTADOS")return;
  const resultados=[
   ...actual.resultados,
   nuevoResultado(actual.resultados.length+1)
  ];
  actualizarSeccion({resultados});
  setResultadoSeleccionado(resultados.length-1);
  setFiltroTipoId(null);
  setFiltroFaseId(null);
 };

 const quitarResultado=(indice:number)=>{
  if(!actual||actual.seccionCodigo!=="RESULTADOS")return;
  const resultados=actual.resultados
   .filter((_,i)=>i!==indice)
   .map((r,i)=>({...r,orden:i+1}));
  actualizarSeccion({resultados});
  setResultadoSeleccionado(resultados.length?Math.min(indice,resultados.length-1):0);
  setFiltroTipoId(null);
  setFiltroFaseId(null);
 };

 const moverResultado=(indice:number,direccion:number)=>{
  if(!actual||actual.seccionCodigo!=="RESULTADOS")return;
  const j=indice+direccion;
  if(j<0||j>=actual.resultados.length)return;
  const resultados=[...actual.resultados];
  [resultados[indice],resultados[j]]=[resultados[j],resultados[indice]];
  actualizarSeccion({resultados:resultados.map((r,i)=>({...r,orden:i+1}))});
  setResultadoSeleccionado(j);
  setFiltroTipoId(null);
  setFiltroFaseId(null);
 };

 const alternarParametro=(p:ParametroFt)=>{
  if(!resultadoActual||ocupados.has(p.versionFtCaracteristicaId))return;
  const existe=resultadoActual.caracteristicas.some(x=>x.versionFtCaracteristicaId===p.versionFtCaracteristicaId);
  const caracteristicas=existe
   ?resultadoActual.caracteristicas.filter(x=>x.versionFtCaracteristicaId!==p.versionFtCaracteristicaId)
   :[...resultadoActual.caracteristicas,{versionFtCaracteristicaId:p.versionFtCaracteristicaId,orden:resultadoActual.caracteristicas.length+1}];
  actualizarResultado({caracteristicas:caracteristicas.map((x,i)=>({...x,orden:i+1}))});
 };

 const parametrosFiltrados=useMemo(
  ()=>(parametros.data??[]).filter(p=>
   (filtroTipoId==null||p.tipoCaractId===filtroTipoId)&&
   (filtroFaseId==null||p.versionFaseId===filtroFaseId)
  ),
  [parametros.data,filtroTipoId,filtroFaseId]
 );

 const metodosSeleccionados=useMemo(()=>{
  const ids=new Set(secciones.flatMap(s=>s.resultados.flatMap(r=>r.caracteristicas.map(c=>c.versionFtCaracteristicaId))));
  return (parametros.data??[]).filter(p=>ids.has(p.versionFtCaracteristicaId)&&p.metEnsayoDescripcion);
 },[secciones,parametros.data]);

 if(plantilla.isLoading)return <PageContainer>Cargando diseñador...</PageContainer>;
 if(!plantilla.data)return <PageContainer>No se encontró la plantilla.</PageContainer>;

 const encabezado=actual?.seccionCodigo==="ENCABEZADO"?leerEncabezado(actual.contenido):null;

 return <PageContainer className="space-y-5">
  <div className="flex items-start justify-between gap-4">
   <div>
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--primary)]">Gestión documental · Diseño de certificados</p>
    <h1 className="mt-1 text-2xl font-semibold">{plantilla.data.nombre}</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{plantilla.data.productoCodigo??"—"} · {plantilla.data.documentoCodigo} · FT v{plantilla.data.versionNumero}</p>
   </div>
   <div className="flex gap-2">
    <Button variant="outline" className="bg-white" onClick={()=>nav("/documentos/diseno-certificados?tab=plantillas")}><ArrowLeft/>Plantillas</Button>
    <Button disabled={!secciones.length||guardar.isPending} onClick={()=>guardar.mutate()}><Save/>{guardar.isPending?"Guardando...":"Guardar diseño"}</Button>
   </div>
  </div>

  <div className="grid min-h-[680px] gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
   <Card className="h-fit overflow-hidden xl:sticky xl:top-4">
    <CardContent className="p-0">
     <div className="border-b bg-[linear-gradient(135deg,var(--primary-soft)_0%,white_100%)] px-4 py-4">
      <div className="flex items-center justify-between">
       <div><h2 className="font-semibold text-[var(--primary-strong)]">Estructura</h2><p className="text-xs text-[var(--text-secondary)]">{secciones.length} secciones</p></div>
       <div className="flex size-9 items-center justify-center rounded-lg bg-white text-[var(--primary)] shadow-sm"><Layers3 className="size-5"/></div>
      </div>
     </div>

     <div className="p-2">
      {secciones.map((s,i)=><div key={s.certificadoSeccionId} className={"mb-1 flex items-center gap-1 rounded-lg border transition "+(seccionSeleccionada===i?"border-[var(--primary)] bg-[var(--primary-soft)]":"border-transparent hover:bg-slate-50")}>
       <button type="button" onClick={()=>{setSeccionSeleccionada(i);setResultadoSeleccionado(0);setFiltroTipoId(null);setFiltroFaseId(null)}} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-3 text-left">
        <GripVertical className="size-4 shrink-0 text-slate-400"/>
        <span className={"w-6 text-xs font-semibold "+(seccionSeleccionada===i?"text-[var(--primary)]":"text-slate-400")}>{String(i+1).padStart(2,"0")}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.seccionDescripcion}</span>
        {!s.visible&&<EyeOff className="size-3.5 shrink-0 text-slate-400"/>}
        {s.seccionCodigo==="RESULTADOS"&&<span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] font-bold text-white">{s.resultados.length}</span>}
       </button>
       <div className="mr-1 flex">
        <Button variant="ghost" size="icon-sm" disabled={!s.permiteReordenar||i===0} onClick={()=>moverSeccion(-1,i)}><ArrowUp/></Button>
        <Button variant="ghost" size="icon-sm" disabled={!s.permiteReordenar||i===secciones.length-1} onClick={()=>moverSeccion(1,i)}><ArrowDown/></Button>
       </div>
      </div>)}
     </div>
    </CardContent>
   </Card>

   {!actual?<Card><CardContent className="p-10 text-center text-sm text-[var(--text-secondary)]"><FileText className="mx-auto mb-3 size-8 opacity-40"/>Selecciona una sección.</CardContent></Card>:
   <div className="space-y-4">
    <Card className="overflow-hidden border-[var(--border)]">
     <div className="h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary))]"/>
     <CardContent className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
       <div>
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--primary)]">Sección</p>
        <h2 className="mt-1 text-lg font-semibold">{actual.seccionDescripcion}</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{actual.tipoContenido}</p>
       </div>
       <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!actual.permiteReordenar||seccionSeleccionada===0} onClick={()=>moverSeccion(-1)}><ArrowUp/>Subir</Button>
        <Button variant="outline" size="sm" disabled={!actual.permiteReordenar||seccionSeleccionada===secciones.length-1} onClick={()=>moverSeccion(1)}><ArrowDown/>Bajar</Button>
        {actual.puedeEliminarse&&<Button variant="outline" size="sm" onClick={quitarSeccion}><Trash2/>Quitar</Button>}
       </div>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={actual.visible} onChange={e=>actualizarSeccion({visible:e.target.checked})}/>Visible en certificado</label>
     </CardContent>
    </Card>

    {actual.seccionCodigo==="ENCABEZADO"&&encabezado&&<Card><CardContent className="space-y-4 p-5">
     <div><h3 className="font-semibold">Valor de la sección</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">La sección es “Título y subtítulo”; estos son sus valores.</p></div>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Título</span><Input value={encabezado.titulo} onChange={e=>actualizarSeccion({contenido:JSON.stringify({...encabezado,titulo:e.target.value})})}/></label>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Subtítulo</span><Input value={encabezado.subtitulo} onChange={e=>actualizarSeccion({contenido:JSON.stringify({...encabezado,subtitulo:e.target.value})})}/></label>
     <div className="rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/35 p-6 text-center"><div className="text-sm font-semibold uppercase tracking-wide">{encabezado.titulo}</div><div className="mt-1 text-xl font-bold">{encabezado.subtitulo}</div></div>
    </CardContent></Card>}

    {actual.seccionCodigo==="DATOS_EMPRESA"&&<Card><CardContent className="p-5">
     <div className="flex items-start gap-3"><Building2 className="mt-0.5 size-5 text-slate-500"/><div><h3 className="font-semibold">Valor dinámico de la sección</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Se obtiene desde Datos para certificado - Empresa.</p></div></div>
     <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/55 p-4 text-sm">
      <div className="font-semibold">{empresa.data?.razonSocial||"—"}</div>
      <div className="mt-2"><b>D:</b> {empresa.data?.direccion||"—"}</div>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1"><span><b>T:</b> {empresa.data?.telefono||"—"}</span><span><b>F:</b> {empresa.data?.fax||"—"}</span><span><b>E:</b> {empresa.data?.correo||"—"}</span><span><b>W:</b> {empresa.data?.sitioWeb||"—"}</span></div>
     </div>
    </CardContent></Card>}

    {actual.seccionCodigo==="PRODUCTO"&&<Card><CardContent className="p-5">
     <h3 className="font-semibold">Valor dinámico de la sección</h3>
     <p className="mt-1 text-sm text-[var(--text-secondary)]">Se obtiene desde la Ficha Técnica asociada.</p>
     <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/55 p-4 text-sm"><b>OVOPRODUCTO:</b> {plantilla.data.productoCodigo||"—"} - {plantilla.data.documentoDescripcionDocumento}</div>
    </CardContent></Card>}

    {actual.seccionCodigo==="DATOS_LOTE"&&<Card><CardContent className="p-5">
     <h3 className="font-semibold">Valor dinámico de la sección</h3>
     <p className="mt-1 text-sm text-[var(--text-secondary)]">Se resolverá con el lote al momento de emitir.</p>
     <div className="mt-4 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/55 p-4 text-sm sm:grid-cols-2"><div><b>Fecha Producción:</b> [lote]</div><div><b>Fecha Caducidad:</b> [lote/FT]</div><div><b>N° Lote:</b> [lote]</div><div><b>Vida Útil:</b> [FT]</div></div>
    </CardContent></Card>}

    {actual.seccionCodigo==="RESULTADOS"&&<Card><CardContent className="space-y-5 p-5">
     <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="font-semibold">Valor / configuración de la sección</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">La sección es única. Dentro de ella puedes definir 1..N informes de ensayo.</p></div>
      <Button size="sm" onClick={agregarResultado}><Plus/>Agregar informe</Button>
     </div>

     <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2">
       {actual.resultados.length===0?<div className="rounded-lg border border-dashed p-4 text-sm text-[var(--text-secondary)]">Aún no hay informes configurados.</div>:actual.resultados.map((r,i)=><button key={i} type="button" onClick={()=>setResultadoSeleccionado(i)} className={"w-full rounded-lg border p-3 text-left "+(resultadoSeleccionado===i?"border-[var(--primary)] bg-[var(--primary-soft)]":"bg-white hover:bg-slate-50")}><div className="flex items-center justify-between gap-2"><span className="font-medium">{r.titulo}</span><span className="rounded bg-slate-200 px-1.5 py-.5 text-[10px] font-semibold">{r.caracteristicas.length}</span></div></button>)}
      </div>

      {!resultadoActual?<div className="rounded-lg border border-dashed p-8 text-center text-sm text-[var(--text-secondary)]">Agrega o selecciona un informe de ensayo.</div>:<div className="space-y-4 rounded-lg border p-4">
       <div className="flex flex-wrap gap-2">
        <Input className="min-w-[260px] flex-1" value={resultadoActual.titulo} onChange={e=>actualizarResultado({titulo:e.target.value})}/>
        <Button variant="outline" size="sm" disabled={resultadoSeleccionado===0} onClick={()=>moverResultado(resultadoSeleccionado,-1)}><ArrowUp/></Button>
        <Button variant="outline" size="sm" disabled={resultadoSeleccionado===actual.resultados.length-1} onClick={()=>moverResultado(resultadoSeleccionado,1)}><ArrowDown/></Button>
        <Button variant="outline" size="sm" onClick={()=>quitarResultado(resultadoSeleccionado)}><Trash2/></Button>
       </div>

       <div className="grid gap-3 md:grid-cols-2">
        <div>
         <label className="mb-1 block text-xs font-semibold text-slate-600">Filtrar por tipo</label>
         <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={filtroTipoId??""} onChange={e=>setFiltroTipoId(e.target.value?Number(e.target.value):null)}>
          <option value="">Todos los tipos</option>
          {tipos.map(([id,n])=><option key={id} value={id}>{n}</option>)}
         </select>
        </div>
        <div>
         <label className="mb-1 block text-xs font-semibold text-slate-600">Filtrar por fase / etapa</label>
         <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={filtroFaseId??""} onChange={e=>setFiltroFaseId(e.target.value?Number(e.target.value):null)}>
          <option value="">Todas las fases</option>
          {fases.map(([id,n])=><option key={id} value={id}>{n}</option>)}
         </select>
        </div>
       </div>

       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={resultadoActual.visible} onChange={e=>actualizarResultado({visible:e.target.checked})}/>Visible en certificado</label>

       <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
         <thead className="bg-[var(--primary-soft)] text-left text-[var(--primary-strong)]"><tr><th className="p-3">Usar</th><th className="p-3">Determinación</th><th className="p-3">Tipo</th><th className="p-3">Fase</th><th className="p-3">Unidad</th></tr></thead>
         <tbody>{parametrosFiltrados.map(p=>{const activo=resultadoActual.caracteristicas.some(x=>x.versionFtCaracteristicaId===p.versionFtCaracteristicaId),ocupado=ocupados.has(p.versionFtCaracteristicaId);return <tr key={p.versionFtCaracteristicaId} className={"border-t "+(ocupado?"opacity-40":"")}><td className="p-3"><button type="button" disabled={ocupado} onClick={()=>alternarParametro(p)} className={"flex size-7 items-center justify-center rounded border "+(activo?"border-[var(--primary)] bg-[var(--primary)] text-white":"bg-white")}>{activo&&<Check className="size-4"/>}</button></td><td className="p-3 font-medium">{p.determinacion}</td><td className="p-3">{p.tipoCaractDescripcion??"—"}</td><td className="p-3">{p.faseDescripcion||p.faseCodigo||"—"}</td><td className="p-3">{p.unidadDeMedida||"—"}</td></tr>})}</tbody>
        </table>
       </div>
      </div>}
     </div>
    </CardContent></Card>}

    {actual.seccionCodigo==="ALMACENAMIENTO"&&<Card><CardContent className="p-5"><h3 className="font-semibold">Valor dinámico de la sección</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Se obtiene desde la Ficha Técnica vigente: condición de almacenamiento y, cuando corresponda, descongelamiento.</p></CardContent></Card>}

    {actual.seccionCodigo==="REFERENCIAS"&&<Card><CardContent className="p-5"><h3 className="font-semibold">Valor dinámico de la sección</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Se construye desde los métodos de ensayo de las características incluidas en los informes.</p><div className="mt-4 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/55 p-4 text-sm">{metodosSeleccionados.length?metodosSeleccionados.map(p=><div key={p.versionFtCaracteristicaId}><b>{p.determinacion}:</b> {p.metEnsayoDescripcion}</div>):<span className="text-[var(--text-secondary)]">Aún no hay características seleccionadas.</span>}</div></CardContent></Card>}

    {actual.seccionCodigo==="FIRMA"&&<Card><CardContent className="p-5"><h3 className="font-semibold">Valor dinámico de la sección</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Responsable, cargo y fecha se completarán al emitir.</p><div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/55 p-4 text-sm"><div>[Responsable]</div><div>[Cargo]</div><div>[Fecha]</div></div></CardContent></Card>}

    {actual.seccionCodigo==="PIE"&&<Card><CardContent className="p-5"><h3 className="font-semibold">Valor de la sección</h3><textarea className="mt-4 min-h-28 w-full rounded-md border bg-background p-3 text-sm" value={actual.contenido??""} onChange={e=>actualizarSeccion({contenido:e.target.value})}/></CardContent></Card>}
   </div>}
  </div>

  {guardar.isSuccess&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Diseño guardado correctamente.</div>}
  {guardar.isError&&<p className="text-sm text-red-600">{guardar.error instanceof Error?guardar.error.message:"No se pudo guardar el diseño."}</p>}
 </PageContainer>
}
