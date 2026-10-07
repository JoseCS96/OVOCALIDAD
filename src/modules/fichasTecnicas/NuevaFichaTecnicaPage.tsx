import {useEffect,useMemo,useState} from "react";
import {useMutation,useQuery} from "@tanstack/react-query";
import {ArrowLeft,FilePlus2,RefreshCw} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {buscarPresentacionesGenesisEt,listarEt} from "@/modules/especificaciones/api";
import {crearFt,listarFt} from "./api";

type ProductoSeleccionado={codigoGenesis:string;nombreGenesis:string;descripcionGenesis:string};

export default function NuevaFichaTecnicaPage(){
 const nav=useNavigate();
 const [busqueda,setBusqueda]=useState("");
 const [producto,setProducto]=useState<ProductoSeleccionado|null>(null);
 const [abierto,setAbierto]=useState(false);
 const [versionEtOrigenId,setVersionEtOrigenId]=useState<number|null>(null);
 const [form,setForm]=useState({documentoCodigo:"",documentoDescripcionDocumento:"",versionNumero:"1",versionInicioVigencia:"",versionNroPaginas:"",versionDescripcion:""});

 const productoCodigo=producto?.descripcionGenesis??"";

 const genesis=useQuery({
  queryKey:["ft-genesis",busqueda.trim()],
  queryFn:()=>buscarPresentacionesGenesisEt(busqueda.trim()),
  enabled:busqueda.trim().length>=2&&!producto,
  staleTime:60000
 });

 const fichas=useQuery({
  queryKey:["ft-producto",productoCodigo],
  queryFn:()=>listarFt(productoCodigo),
  enabled:!!productoCodigo
 });

 const especificaciones=useQuery({
  queryKey:["ft-et-origen",productoCodigo],
  queryFn:()=>listarEt({productoCodigo}),
  enabled:!!productoCodigo
 });

 const versionesProducto=useMemo(
  ()=> (fichas.data??[]).filter(x=>x.productoCodigo===productoCodigo),
  [fichas.data,productoCodigo]
 );

 const ftExistente=useMemo(
  ()=>[...versionesProducto].sort((a,b)=>(b.versionNumero??0)-(a.versionNumero??0))[0]??null,
  [versionesProducto]
 );

 const etsProducto=useMemo(
  ()=>[...(especificaciones.data??[])]
    .filter(x=>x.productoCodigo===productoCodigo)
    .sort((a,b)=>(b.versionNumero??0)-(a.versionNumero??0)),
  [especificaciones.data,productoCodigo]
 );

 useEffect(()=>{
  if(!producto)return;
  setVersionEtOrigenId(null);
  if(ftExistente){
   const siguiente=(Math.max(...versionesProducto.map(x=>x.versionNumero??0),0)+1);
   setForm(v=>({
    ...v,
    documentoCodigo:ftExistente.documentoCodigo,
    documentoDescripcionDocumento:ftExistente.documentoDescripcionDocumento,
    versionNumero:String(siguiente),
    versionInicioVigencia:"",
    versionNroPaginas:ftExistente.versionNroPaginas?String(ftExistente.versionNroPaginas):"",
    versionDescripcion:""
   }));
  }else if(!fichas.isFetching){
   setForm(v=>({...v,documentoCodigo:"",documentoDescripcionDocumento:"",versionNumero:"1",versionInicioVigencia:"",versionNroPaginas:"",versionDescripcion:""}));
  }
 },[producto,ftExistente,versionesProducto,fichas.isFetching]);

 const crear=useMutation({
  mutationFn:crearFt,
  onSuccess:r=>{if(r.versionId)nav(`/documentos/fichas-tecnicas/${r.versionId}/editar`)}
 });

 const seleccionarProducto=(x:ProductoSeleccionado)=>{
  setProducto(x);
  setBusqueda(`${x.codigoGenesis} — ${x.nombreGenesis}`);
  setAbierto(false);
 };

 const limpiarProducto=()=>{
  setProducto(null);
  setBusqueda("");
  setVersionEtOrigenId(null);
  setForm({documentoCodigo:"",documentoDescripcionDocumento:"",versionNumero:"1",versionInicioVigencia:"",versionNroPaginas:"",versionDescripcion:""});
 };

 const submit=(e:React.FormEvent)=>{
  e.preventDefault();
  if(!producto||!versionEtOrigenId)return;
  crear.mutate({
   documentoCodigo:form.documentoCodigo.trim(),
   documentoDescripcionDocumento:form.documentoDescripcionDocumento.trim(),
   productoCodigo,
   versionNumero:ftExistente?null:(Number(form.versionNumero)||1),
   versionInicioVigencia:form.versionInicioVigencia||null,
   versionReemplazaAId:null,
   versionNroPaginas:form.versionNroPaginas?Number(form.versionNroPaginas):null,
   versionDescripcion:form.versionDescripcion.trim()||null,
   versionEtOrigenId
  });
 };

 const cargandoContexto=!!producto&&(fichas.isFetching||especificaciones.isFetching);
 const puedeCrear=!!producto&&!cargandoContexto&&!!versionEtOrigenId&&!crear.isPending;

 return <PageContainer className="space-y-4">
  <div className="flex items-start justify-between gap-3">
   <div>
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental</p>
    <h1 className="mt-1 text-2xl font-semibold">{ftExistente?"Nueva versión de ficha técnica":"Nueva ficha técnica"}</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{ftExistente?"Crea una nueva versión sobre la FT maestra del producto, tomando una ET como origen.":"Crea la primera FT del producto y toma una ET como base técnica."}</p>
   </div>
   <Button variant="outline" onClick={()=>nav("/documentos/fichas-tecnicas")}><ArrowLeft/>Volver</Button>
  </div>

  <Card><CardContent className="p-6">
   <form onSubmit={submit} className="space-y-5">
    <Campo label="Producto / presentación Génesis">
     <div className="flex gap-2">
      <div className="relative flex-1">
       <Input required value={busqueda} readOnly={!!producto} onFocus={()=>setAbierto(true)} onChange={e=>{setBusqueda(e.target.value);setProducto(null);setAbierto(true)}} placeholder="Escribe YL03, CL01..." autoComplete="off"/>
       {abierto&&!producto&&busqueda.trim().length>=2&&<div className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-white p-1 shadow-xl">
        {genesis.isFetching?<div className="p-3 text-sm">Buscando...</div>:(genesis.data??[]).map(x=><button key={x.codigoGenesis} type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={()=>seleccionarProducto(x)}><b>{x.codigoGenesis}</b> — {x.nombreGenesis}</button>)}
       </div>}
      </div>
      {producto&&<Button type="button" variant="outline" onClick={limpiarProducto}><RefreshCw className="h-4 w-4"/>Cambiar</Button>}
     </div>
    </Campo>

    {producto&&<div className="rounded-lg border bg-slate-50 p-4">
     {fichas.isFetching?<p className="text-sm text-[var(--text-secondary)]">Verificando ficha técnica del producto...</p>:ftExistente?<div className="space-y-1">
      <p className="text-sm font-semibold">FT existente encontrada</p>
      <p className="text-sm"><b>{ftExistente.documentoCodigo}</b> — {ftExistente.documentoDescripcionDocumento}</p>
      <p className="text-xs text-[var(--text-secondary)]">Versión actual: {ftExistente.versionNumero??"-"} · {ftExistente.estadoVersion}. Se creará la siguiente versión sobre este mismo documento.</p>
     </div>:<div className="space-y-1">
      <p className="text-sm font-semibold">Primera FT del producto</p>
      <p className="text-xs text-[var(--text-secondary)]">No existe una ficha técnica activa para este producto. Se creará el documento maestro y su versión 1.</p>
     </div>}
    </div>}

    {producto&&<Campo label="Especificación Técnica de origen">
     <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={versionEtOrigenId??""} onChange={e=>setVersionEtOrigenId(e.target.value?Number(e.target.value):null)} disabled={especificaciones.isFetching}>
      <option value="">{especificaciones.isFetching?"Cargando ET del producto...":"Seleccione la ET que servirá de base"}</option>
      {etsProducto.map(et=><option key={et.versionId} value={et.versionId}>{et.documentoCodigo} · v{et.versionNumero??"-"} · {et.estadoVersion}</option>)}
     </select>
     {!especificaciones.isFetching&&etsProducto.length===0&&<p className="text-xs text-red-600">El producto no tiene una Especificación Técnica disponible para usar como origen.</p>}
    </Campo>}

    <div className="grid gap-4 md:grid-cols-2">
     <Campo label="Código FT"><Input required disabled={!!ftExistente||fichas.isFetching} value={form.documentoCodigo} onChange={e=>setForm({...form,documentoCodigo:e.target.value})} placeholder="Ej. OVOPE-CA-F-018"/></Campo>
     <Campo label="Versión"><Input required disabled={!!ftExistente} min="0.0001" step="0.0001" type="number" value={form.versionNumero} onChange={e=>setForm({...form,versionNumero:e.target.value})}/></Campo>
     <div className="md:col-span-2"><Campo label="Nombre / descripción"><Input required disabled={!!ftExistente||fichas.isFetching} value={form.documentoDescripcionDocumento} onChange={e=>setForm({...form,documentoDescripcionDocumento:e.target.value})}/></Campo></div>
     <Campo label="Inicio de vigencia"><Input type="date" value={form.versionInicioVigencia} onChange={e=>setForm({...form,versionInicioVigencia:e.target.value})}/></Campo>
     <Campo label="N.º páginas"><Input min="1" type="number" value={form.versionNroPaginas} onChange={e=>setForm({...form,versionNroPaginas:e.target.value})}/></Campo>
     <div className="md:col-span-2"><Campo label="Descripción de versión"><Input value={form.versionDescripcion} onChange={e=>setForm({...form,versionDescripcion:e.target.value})}/></Campo></div>
    </div>

    {crear.isError&&<p className="text-sm text-red-600">{crear.error instanceof Error?crear.error.message:"No se pudo crear la ficha técnica."}</p>}

    <div className="flex justify-end gap-2 border-t pt-4">
     <Button type="button" variant="outline" onClick={()=>nav("/documentos/fichas-tecnicas")}>Cancelar</Button>
     <Button type="submit" disabled={!puedeCrear}><FilePlus2/>{crear.isPending?"Creando...":ftExistente?"Crear nueva versión y configurar":"Crear FT y configurar"}</Button>
    </div>
   </form>
  </CardContent></Card>
 </PageContainer>
}

function Campo({label,children}:{label:string;children:React.ReactNode}){
 return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>
}
