import {useMemo,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Eye,FilePlus2,Pencil,Search} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {listarEt,obtenerCatalogosEt} from "./api";

export default function EspecificacionesTecnicasPage(){
 const nav=useNavigate(),[buscar,setBuscar]=useState(""),[estado,setEstado]=useState("");
 const q=useQuery({queryKey:["et-listado"],queryFn:()=>listarEt()});
 const cat=useQuery({queryKey:["et-catalogos"],queryFn:obtenerCatalogosEt});
 const items=useMemo(()=>{const b=buscar.trim().toLowerCase();return(q.data??[]).filter(x=>(!b||[x.documentoCodigo,x.documentoDescripcionDocumento,x.productoCodigo,x.productoDescripcion??""].some(v=>v.toLowerCase().includes(b)))&&(!estado||x.estadoVersion===estado))},[q.data,buscar,estado]);
 const estados=useMemo(()=>Array.from(new Set((q.data??[]).map(x=>x.estadoVersion))),[q.data]);
 return <PageContainer className="space-y-4">
  <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental</p><h1 className="mt-1 text-2xl font-semibold">Especificaciones técnicas</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Administra documentos, versiones y especificaciones de producto.</p></div><Button onClick={()=>alert("El flujo Nueva ET será el siguiente vertical.")}><FilePlus2/>Nueva ET</Button></div>
  <Card><CardContent className="p-4"><div className="grid gap-3 md:grid-cols-[1fr_240px]"><div className="relative"><Search className="absolute left-2.5 top-2 size-4 text-[var(--text-secondary)]"/><Input className="pl-8" placeholder="Buscar por código, producto o descripción..." value={buscar} onChange={e=>setBuscar(e.target.value)}/></div><select className="h-8 rounded-lg border bg-white px-2 text-sm" value={estado} onChange={e=>setEstado(e.target.value)}><option value="">Todos los estados</option>{estados.map(x=><option key={x}>{x}</option>)}</select></div></CardContent></Card>
  <Card><CardContent className="p-0">{q.isLoading?<div className="p-10 text-center">Cargando especificaciones...</div>:q.isError?<div className="p-10 text-center text-red-600">No se pudo cargar el listado.</div>:<div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Código</th><th>Producto</th><th>Versión</th><th>Inicio vigencia</th><th>Estado</th><th>Actualizado</th><th className="px-5 text-right">Acciones</th></tr></thead><tbody>{items.map(x=><tr key={x.versionId} className="border-t hover:bg-slate-50/70"><td className="px-5 py-3"><b>{x.documentoCodigo}</b><div className="max-w-[320px] truncate text-xs text-[var(--text-secondary)]">{x.documentoDescripcionDocumento}</div></td><td><b>{x.productoCodigo}</b><div className="text-xs text-[var(--text-secondary)]">{x.productoDescripcion??"—"}</div></td><td>{x.versionNumero??"—"}</td><td>{fecha(x.versionInicioVigencia)}</td><td><Badge variant="outline">{x.estadoVersion}</Badge></td><td>{fecha(x.audFechaActualizacion??x.audFechaCreacion)}</td><td className="px-5 text-right"><div className="inline-flex gap-1"><Button variant="outline" size="sm" onClick={()=>nav(`/documentos/especificaciones/${x.versionId}`)}><Eye/>Ver detalle</Button>{x.permiteEditar&&<Button size="sm" onClick={()=>nav(`/documentos/especificaciones/${x.versionId}/editar`)}><Pencil/>Editar</Button>}</div></td></tr>)}{!items.length&&<tr><td colSpan={7} className="p-10 text-center text-[var(--text-secondary)]">No se encontraron especificaciones técnicas.</td></tr>}</tbody></table></div>}</CardContent></Card>
  <p className="text-xs text-[var(--text-secondary)]">{items.length} especificación(es) mostrada(s).</p>
 </PageContainer>
}
function fecha(v:string|null){return v?new Date(v).toLocaleDateString("es-PE"):"—"}
