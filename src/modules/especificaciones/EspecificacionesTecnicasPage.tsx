import {useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowDown,ArrowLeft,ArrowUp,Check,Eye,FilePlus2,Pencil,Search} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {crearEt,listarEt,obtenerCatalogosEt} from "./api";

const SECCIONES=[
 {id:11,n:"INFORMACIÓN GENERAL",fija:true},{id:12,n:"RESPONSABLES"},{id:13,n:"DESCRIPCIÓN"},{id:14,n:"INGREDIENTES"},
 {id:15,n:"RECETAS"},{id:16,n:"PROCEDIMIENTOS"},{id:17,n:"TRATAMIENTOS"},{id:18,n:"CARACTERÍSTICAS"},
 {id:19,n:"PRESENTACIÓN / ENVASES Y EMBALAJES"},{id:20,n:"ALMACENAMIENTO Y DISTRIBUCIÓN"},{id:21,n:"VIDA ÚTIL"},
 {id:22,n:"DESCONGELAMIENTO"},{id:23,n:"INSTRUCCIONES"},{id:24,n:"CONTENIDO DEL ROTULADO"},{id:25,n:"CAMBIOS DE ESTA VERSIÓN"},{id:26,n:"ANEXOS"}
];

export default function EspecificacionesTecnicasPage(){
 const nav=useNavigate(),qc=useQueryClient(),[buscar,setBuscar]=useState(""),[estado,setEstado]=useState(""),[nueva,setNueva]=useState(false),[paso,setPaso]=useState(1);
 const [seleccion,setSeleccion]=useState<number[]>(SECCIONES.map(x=>x.id));
 const [form,setForm]=useState({documentoCodigo:"",documentoDescripcionDocumento:"",productoCodigo:"",versionNumero:"1",versionInicioVigencia:"",versionNroPaginas:""});
 const q=useQuery({queryKey:["et-listado"],queryFn:()=>listarEt()}); const cat=useQuery({queryKey:["et-catalogos"],queryFn:obtenerCatalogosEt});
 const items=useMemo(()=>{const b=buscar.trim().toLowerCase();return(q.data??[]).filter(x=>(!b||[x.documentoCodigo,x.documentoDescripcionDocumento,x.productoCodigo,x.productoDescripcion??""].some(v=>v.toLowerCase().includes(b)))&&(!estado||x.estadoVersion===estado))},[q.data,buscar,estado]);
 const estados=useMemo(()=>Array.from(new Set((q.data??[]).map(x=>x.estadoVersion))),[q.data]);
 const crear=useMutation({mutationFn:crearEt,onSuccess:async r=>{await qc.invalidateQueries({queryKey:["et-listado"]});if(r.versionId)nav(`/documentos/especificaciones/${r.versionId}/editar`)}});
 const toggle=(id:number)=>setSeleccion(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 const mover=(idx:number,dir:-1|1)=>setSeleccion(s=>{const n=[...s],j=idx+dir;if(j<1||j>=n.length)return s;[n[idx],n[j]]=[n[j],n[idx]];return n});
 const abrir=()=>{setNueva(true);setPaso(1);setSeleccion(SECCIONES.map(x=>x.id))};
 const cancelar=()=>{setNueva(false);setPaso(1)};
 const submit=(e:React.FormEvent)=>{e.preventDefault();crear.mutate({documentoCodigo:form.documentoCodigo.trim(),documentoDescripcionDocumento:form.documentoDescripcionDocumento.trim(),productoCodigo:form.productoCodigo,versionNumero:Number(form.versionNumero)||1,versionInicioVigencia:form.versionInicioVigencia||null,versionReemplazaAId:null,versionNroPaginas:form.versionNroPaginas?Number(form.versionNroPaginas):null,secciones:seleccion.map((seccionId,i)=>({seccionId,orden:i+1})),usuario:"USUARIO_WEB"})};
 return <PageContainer className="space-y-4">
  <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental</p><h1 className="mt-1 text-2xl font-semibold">Especificaciones técnicas</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Administra documentos, versiones y especificaciones de producto.</p></div><Button onClick={abrir}><FilePlus2/>Nueva ET</Button></div>
  {nueva&&<Card><CardContent className="p-6">
   <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--text-secondary)]">Nueva especificación · Paso {paso} de 2</p><h2 className="mt-1 text-xl font-semibold">{paso===1?"Producto y estructura":"Datos de la especificación"}</h2></div><div className="flex gap-2"><Badge variant={paso===1?"default":"outline"}>1 Estructura</Badge><Badge variant={paso===2?"default":"outline"}>2 Datos ET</Badge></div></div>
   {paso===1?<div className="space-y-5">
    <Campo label="1. Selecciona el producto"><select required className="h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.productoCodigo} onChange={e=>setForm({...form,productoCodigo:e.target.value})}><option value="">Seleccionar producto...</option>{(cat.data?.productos??[]).map(p=><option key={p.productoCodigo} value={p.productoCodigo}>{p.productoCodigo} · {p.productoDescripcion}</option>)}</select></Campo>
    <div><div className="mb-3"><h3 className="font-semibold">2. Define las secciones de la ET</h3><p className="text-sm text-[var(--text-secondary)]">Selecciona únicamente las secciones que aplican. Información general es obligatoria.</p></div>
     <div className="grid gap-2 md:grid-cols-2">{SECCIONES.map(s=>{const on=seleccion.includes(s.id);return <button key={s.id} type="button" disabled={s.fija} onClick={()=>toggle(s.id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${on?"border-slate-400 bg-slate-50":"bg-white opacity-70"}`}><span className={`flex size-5 items-center justify-center rounded border ${on?"bg-slate-900 text-white":""}`}>{on&&<Check className="size-3.5"/>}</span><span className="flex-1 text-sm font-medium">{s.n}</span>{s.fija&&<Badge variant="outline">Obligatoria</Badge>}</button>})}</div>
    </div>
    <div className="rounded-lg border bg-slate-50 p-4"><div className="mb-2 flex items-center justify-between"><div><h3 className="font-semibold">Orden de la estructura</h3><p className="text-xs text-[var(--text-secondary)]">{seleccion.length} secciones seleccionadas</p></div><Button variant="outline" size="sm" disabled title="Se habilitará al incorporar persistencia de secciones personalizadas">+ Nueva sección</Button></div>
     <div className="space-y-1">{seleccion.map((id,i)=>{const s=SECCIONES.find(x=>x.id===id)!;return <div key={id} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm"><b className="w-6 text-[var(--text-secondary)]">{i+1}.</b><span className="flex-1">{s.n}</span>{!s.fija&&<><Button type="button" variant="ghost" size="icon-sm" disabled={i<=1} onClick={()=>mover(i,-1)}><ArrowUp/></Button><Button type="button" variant="ghost" size="icon-sm" disabled={i===seleccion.length-1} onClick={()=>mover(i,1)}><ArrowDown/></Button></>}</div>})}</div>
    </div>
    <div className="flex justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={cancelar}>Cancelar</Button><Button disabled={!form.productoCodigo||seleccion.length===0} onClick={()=>setPaso(2)}>Continuar</Button></div>
   </div>:<form onSubmit={submit} className="space-y-4">
    <div className="rounded-lg border bg-slate-50 px-4 py-3 text-sm"><b>{form.productoCodigo}</b> · {cat.data?.productos.find(x=>x.productoCodigo===form.productoCodigo)?.productoDescripcion}<span className="ml-3 text-[var(--text-secondary)]">{seleccion.length} secciones</span></div>
    <div className="grid gap-4 md:grid-cols-2"><Campo label="Código ET"><Input required value={form.documentoCodigo} onChange={e=>setForm({...form,documentoCodigo:e.target.value})} placeholder="Ej. OVOPE-CA-E-253"/></Campo><Campo label="Versión"><Input required min="0.0001" step="0.0001" type="number" value={form.versionNumero} onChange={e=>setForm({...form,versionNumero:e.target.value})}/></Campo><div className="md:col-span-2"><Campo label="Nombre / descripción"><Input required value={form.documentoDescripcionDocumento} onChange={e=>setForm({...form,documentoDescripcionDocumento:e.target.value})}/></Campo></div><Campo label="Inicio de vigencia"><Input type="date" value={form.versionInicioVigencia} onChange={e=>setForm({...form,versionInicioVigencia:e.target.value})}/></Campo><Campo label="N.º páginas"><Input min="1" type="number" value={form.versionNroPaginas} onChange={e=>setForm({...form,versionNroPaginas:e.target.value})}/></Campo></div>
    {crear.isError&&<p className="text-sm text-red-600">{crear.error instanceof Error?crear.error.message:"No se pudo crear la ET."}</p>}
    <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={()=>setPaso(1)} disabled={crear.isPending}><ArrowLeft/>Atrás</Button><Button type="submit" disabled={crear.isPending}>{crear.isPending?"Creando...":"Crear ET"}</Button></div>
   </form>}
  </CardContent></Card>}
  <Card><CardContent className="p-4"><div className="grid gap-3 md:grid-cols-[1fr_240px]"><div className="relative"><Search className="absolute left-2.5 top-2 size-4 text-[var(--text-secondary)]"/><Input className="pl-8" placeholder="Buscar por código, producto o descripción..." value={buscar} onChange={e=>setBuscar(e.target.value)}/></div><select className="h-8 rounded-lg border bg-white px-2 text-sm" value={estado} onChange={e=>setEstado(e.target.value)}><option value="">Todos los estados</option>{estados.map(x=><option key={x}>{x}</option>)}</select></div></CardContent></Card>
  <Card><CardContent className="p-0">{q.isLoading?<div className="p-10 text-center">Cargando especificaciones...</div>:q.isError?<div className="p-10 text-center text-red-600">No se pudo cargar el listado.</div>:<div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Código</th><th>Producto</th><th>Versión</th><th>Inicio vigencia</th><th>Estado</th><th>Actualizado</th><th className="px-5 text-right">Acciones</th></tr></thead><tbody>{items.map(x=><tr key={x.versionId} className="border-t hover:bg-slate-50/70"><td className="px-5 py-3"><b>{x.documentoCodigo}</b><div className="max-w-[320px] truncate text-xs text-[var(--text-secondary)]">{x.documentoDescripcionDocumento}</div></td><td><b>{x.productoCodigo}</b><div className="text-xs text-[var(--text-secondary)]">{x.productoDescripcion??"—"}</div></td><td>{x.versionNumero??"—"}</td><td>{fecha(x.versionInicioVigencia)}</td><td><Badge variant="outline">{x.estadoVersion}</Badge></td><td>{fecha(x.audFechaActualizacion??x.audFechaCreacion)}</td><td className="px-5 text-right"><div className="inline-flex gap-1"><Button variant="outline" size="sm" onClick={()=>nav(`/documentos/especificaciones/${x.versionId}`)}><Eye/>Ver detalle</Button>{x.permiteEditar&&<Button size="sm" onClick={()=>nav(`/documentos/especificaciones/${x.versionId}/editar`)}><Pencil/>Editar</Button>}</div></td></tr>)}{!items.length&&<tr><td colSpan={7} className="p-10 text-center text-[var(--text-secondary)]">No se encontraron especificaciones técnicas.</td></tr>}</tbody></table></div>}</CardContent></Card>
 </PageContainer>
}
function fecha(v:string|null){return v?new Date(v).toLocaleDateString("es-PE"):"—"}
function Campo({label,children}:{label:string;children:React.ReactNode}){return <label className="grid gap-1.5 text-sm font-medium"><span>{label}</span>{children}</label>}
