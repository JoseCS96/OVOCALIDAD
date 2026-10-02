import {useCallback,useEffect,useState} from "react";
import {CirclePlus,Pencil,Power,Search,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {cambiarEstadoFase,guardarFase,listarFases,type FaseMantenimiento} from "./api";

type Filtro="todos"|"activos"|"inactivos";
export default function FasesMantenimientoPage(){
 const [items,setItems]=useState<FaseMantenimiento[]>([]);
 const [busqueda,setBusqueda]=useState(""),[filtro,setFiltro]=useState<Filtro>("todos");
 const [cargando,setCargando]=useState(true),[guardando,setGuardando]=useState(false);
 const [editando,setEditando]=useState<FaseMantenimiento|null|undefined>(undefined);
 const [codigo,setCodigo]=useState(""),[descripcion,setDescripcion]=useState("");
 const [error,setError]=useState(""),[aviso,setAviso]=useState("");
 const cargar=useCallback(async()=>{
  setCargando(true);
  try{setItems(await listarFases({buscar:busqueda.trim()||undefined,incluirInactivos:true}));setError("")}
  catch(e){setError(e instanceof Error?e.message:"No se pudo consultar el maestro de fases.")}
  finally{setCargando(false)}
 },[busqueda]);
 useEffect(()=>{const t=window.setTimeout(()=>{void cargar()},250);return()=>window.clearTimeout(t)},[cargar]);
 const abrir=(x:FaseMantenimiento|null)=>{setEditando(x);setCodigo(x?.codigo??"");setDescripcion(x?.descripcion??"");setError("")};
 const guardar=async()=>{
  if(!codigo.trim()||!descripcion.trim()){setError("Código y descripción son obligatorios.");return}
  setGuardando(true);setError("");
  try{await guardarFase({codigo:codigo.trim().toUpperCase(),descripcion:descripcion.trim()},editando?.faseId);
   setEditando(undefined);setAviso("Fase guardada correctamente.");await cargar()}
  catch(e){setError(e instanceof Error?e.message:"No se pudo guardar la fase.")}
  finally{setGuardando(false)}
 };
 const cambiar=async(x:FaseMantenimiento)=>{
  const estado=x.estado==="ACTIVO"?"INACTIVO":"ACTIVO";
  if(!window.confirm(`¿Deseas ${estado==="ACTIVO"?"activar":"inactivar"} la fase ${x.codigo}? Las asignaciones históricas permanecerán intactas.`))return;
  setGuardando(true);setError("");
  try{await cambiarEstadoFase(x.faseId,estado);setAviso("Estado actualizado.");await cargar()}
  catch(e){setError(e instanceof Error?e.message:"No se pudo actualizar el estado.")}
  finally{setGuardando(false)}
 };
 const visibles=items.filter(x=>filtro==="todos"||(filtro==="activos"?x.estado==="ACTIVO":x.estado==="INACTIVO"));
 return <div className="mx-auto w-full max-w-[1500px] space-y-6 px-6 py-6 xl:px-8">
  <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--text-secondary)]">Mantenimientos</p><h1 className="text-2xl font-semibold">Maestro de Fases</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Catálogo compartido por características de ET y correlativos de lotes.</p></div><Button onClick={()=>abrir(null)}><CirclePlus/>Nueva fase</Button></div>
  {aviso&&<div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{aviso}</div>}
  {error&&editando===undefined&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
  <Card><CardContent className="flex flex-wrap gap-3 p-6"><div className="relative min-w-[280px] flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><Input className="pl-9" placeholder="Buscar por código o descripción..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div><select className="h-10 rounded-md border bg-white px-3 text-sm" value={filtro} onChange={e=>setFiltro(e.target.value as Filtro)}><option value="todos">Todos</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select></CardContent></Card>
  <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[740px] text-sm"><thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Código</th><th>Descripción</th><th>Estado</th><th>Última modificación</th><th className="px-5 text-right">Acciones</th></tr></thead><tbody>
  {cargando?<tr><td colSpan={5} className="px-5 py-10 text-center">Cargando...</td></tr>:visibles.length===0?<tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--text-secondary)]">No se encontraron fases.</td></tr>:visibles.map(x=><tr key={x.faseId} className="border-t"><td className="px-5 py-3 font-semibold">{x.codigo}</td><td>{x.descripcion}</td><td><span className={`rounded-full px-2 py-1 text-xs font-medium ${x.estado==="ACTIVO"?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{x.estado==="ACTIVO"?"Activo":"Inactivo"}</span></td><td>{x.fechaModificacion?new Date(x.fechaModificacion).toLocaleString():"—"}</td><td className="px-5 text-right"><div className="flex justify-end gap-2"><Button size="icon-sm" variant="outline" title="Editar" disabled={guardando} onClick={()=>abrir(x)}><Pencil/></Button><Button size="icon-sm" variant="outline" title={x.estado==="ACTIVO"?"Inactivar":"Activar"} disabled={guardando} onClick={()=>void cambiar(x)}><Power/></Button></div></td></tr>)}
  </tbody></table></div></CardContent></Card>
  {editando!==undefined&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"><div className="w-full max-w-lg rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">{editando?"Editar fase":"Nueva fase"}</h2><p className="text-xs text-[var(--text-secondary)]">Las fases se comparten entre ET y lotes.</p></div><button onClick={()=>setEditando(undefined)} aria-label="Cerrar"><X className="h-5 w-5"/></button></div><div className="space-y-4 p-5"><label className="block text-sm font-medium">Código<Input className="mt-1 uppercase" maxLength={20} value={codigo} onChange={e=>setCodigo(e.target.value)} placeholder="Ej.: PTD"/></label><label className="block text-sm font-medium">Descripción<Input className="mt-1" maxLength={150} value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Descripción de la fase"/></label>{error&&<div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}</div><div className="flex justify-end gap-2 border-t p-5"><Button variant="outline" onClick={()=>setEditando(undefined)}>Cancelar</Button><Button disabled={guardando||!codigo.trim()||!descripcion.trim()} onClick={()=>void guardar()}>{guardando?"Guardando...":"Guardar"}</Button></div></div></div>}
 </div>;
}
