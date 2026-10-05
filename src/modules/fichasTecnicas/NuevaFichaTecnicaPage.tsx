import {useState} from "react";
import {useMutation,useQuery} from "@tanstack/react-query";
import {ArrowLeft,FilePlus2} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {buscarPresentacionesGenesisEt} from "@/modules/especificaciones/api";
import {crearFt} from "./api";

export default function NuevaFichaTecnicaPage(){
 const nav=useNavigate(),[busqueda,setBusqueda]=useState(""),[producto,setProducto]=useState<{codigoGenesis:string;nombreGenesis:string;descripcionGenesis:string}|null>(null),[abierto,setAbierto]=useState(false);
 const [form,setForm]=useState({documentoCodigo:"",documentoDescripcionDocumento:"",versionNumero:"1",versionInicioVigencia:"",versionNroPaginas:"",versionDescripcion:""});
 const genesis=useQuery({queryKey:["ft-genesis",busqueda.trim()],queryFn:()=>buscarPresentacionesGenesisEt(busqueda.trim()),enabled:busqueda.trim().length>=2,staleTime:60000});
 const crear=useMutation({mutationFn:crearFt,onSuccess:r=>{if(r.versionId)nav(`/documentos/fichas-tecnicas/${r.versionId}/editar`)}});
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!producto)return;crear.mutate({documentoCodigo:form.documentoCodigo.trim(),documentoDescripcionDocumento:form.documentoDescripcionDocumento.trim(),productoCodigo:producto.descripcionGenesis,versionNumero:Number(form.versionNumero)||1,versionInicioVigencia:form.versionInicioVigencia||null,versionReemplazaAId:null,versionNroPaginas:form.versionNroPaginas?Number(form.versionNroPaginas):null,versionDescripcion:form.versionDescripcion.trim()||null})};
 return <PageContainer className="space-y-4">
  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Gestión documental</p><h1 className="mt-1 text-2xl font-semibold">Nueva ficha técnica</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Crea la versión comercial que definirá la especificación mostrada en certificados.</p></div><Button variant="outline" onClick={()=>nav("/documentos/fichas-tecnicas")}><ArrowLeft/>Volver</Button></div>
  <Card><CardContent className="p-6"><form onSubmit={submit} className="space-y-5">
   <Campo label="Producto / presentación Génesis"><div className="relative"><Input required value={busqueda} onFocus={()=>setAbierto(true)} onChange={e=>{setBusqueda(e.target.value);setProducto(null);setAbierto(true)}} placeholder="Escribe YL03, CL01..." autoComplete="off"/>{abierto&&busqueda.trim().length>=2&&<div className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-white p-1 shadow-xl">{genesis.isFetching?<div className="p-3 text-sm">Buscando...</div>:(genesis.data??[]).map(x=><button key={x.codigoGenesis} type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={()=>{setProducto(x);setBusqueda(`${x.codigoGenesis} — ${x.nombreGenesis}`);setAbierto(false)}}><b>{x.codigoGenesis}</b> — {x.nombreGenesis}</button>)}</div>}</div></Campo>
   <div className="grid gap-4 md:grid-cols-2"><Campo label="Código FT"><Input required value={form.documentoCodigo} onChange={e=>setForm({...form,documentoCodigo:e.target.value})} placeholder="Ej. OVOPE-CA-F-018"/></Campo><Campo label="Versión"><Input required min="0.0001" step="0.0001" type="number" value={form.versionNumero} onChange={e=>setForm({...form,versionNumero:e.target.value})}/></Campo><div className="md:col-span-2"><Campo label="Nombre / descripción"><Input required value={form.documentoDescripcionDocumento} onChange={e=>setForm({...form,documentoDescripcionDocumento:e.target.value})}/></Campo></div><Campo label="Inicio de vigencia"><Input type="date" value={form.versionInicioVigencia} onChange={e=>setForm({...form,versionInicioVigencia:e.target.value})}/></Campo><Campo label="N.º páginas"><Input min="1" type="number" value={form.versionNroPaginas} onChange={e=>setForm({...form,versionNroPaginas:e.target.value})}/></Campo><div className="md:col-span-2"><Campo label="Descripción de versión"><Input value={form.versionDescripcion} onChange={e=>setForm({...form,versionDescripcion:e.target.value})}/></Campo></div></div>
   {crear.isError&&<p className="text-sm text-red-600">{crear.error instanceof Error?crear.error.message:"No se pudo crear la ficha técnica."}</p>}
   <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={()=>nav("/documentos/fichas-tecnicas")}>Cancelar</Button><Button type="submit" disabled={!producto||crear.isPending}><FilePlus2/>{crear.isPending?"Creando...":"Crear FT y configurar"}</Button></div>
  </form></CardContent></Card>
 </PageContainer>
}
function Campo({label,children}:{label:string;children:React.ReactNode}){return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>}
