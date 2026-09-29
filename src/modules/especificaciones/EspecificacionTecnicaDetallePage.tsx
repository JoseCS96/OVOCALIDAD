import {useMemo,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {ArrowLeft,ExternalLink,FileText,Layers3} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {cambiarEstadoEt,obtenerEt} from "./api";
import type {AccionWorkflowEt,CaracteristicaEt,DetalleEt,SeccionEt} from "./types";
import EtDocumentPreview from "./components/EtDocumentPreview";
import EtWorkflowActions from "./components/EtWorkflowActions";
export default function EspecificacionTecnicaDetallePage(){
 const nav=useNavigate(),qc=useQueryClient(),{versionId}=useParams(),id=Number(versionId),q=useQuery({queryKey:["et",id],queryFn:()=>obtenerEt(id),enabled:id>0}),[sel,setSel]=useState<number|null>(null),[vista,setVista]=useState<"secciones"|"documento"|"pdf">("documento"),[mensaje,setMensaje]=useState(""),[error,setError]=useState("");
 const workflow=useMutation({mutationFn:({accion,comentario}:{accion:AccionWorkflowEt;comentario:string|null})=>cambiarEstadoEt(id,{accion,comentario}),onSuccess:async()=>{setError("");await qc.invalidateQueries({queryKey:["et",id]});setMensaje("Estado actualizado correctamente.");window.setTimeout(()=>setMensaje(""),3000)},onError:(e:Error)=>setError(e.message)});
 const secs=useMemo(()=>presentacionSecciones(q.data?.secciones??[]),[q.data]),act=secs.find(x=>x.seccionId===(sel??secs[0]?.seccionId));
 if(q.isLoading)return <PageContainer><div className="py-16 text-center">Cargando Especificación Técnica...</div></PageContainer>;
 if(q.isError||!q.data)return <PageContainer><div className="py-16 text-center text-red-600">No se pudo cargar la Especificación Técnica.</div></PageContainer>;
 const d=q.data,i=d.informacionGeneral;
 return <PageContainer className="space-y-4">{error&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{mensaje&&<div role="status" className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[1px]"><div className="flex min-w-[320px] max-w-md items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-white px-7 py-6 text-base font-semibold text-emerald-700 shadow-2xl"><span className="text-xl">✓</span>{mensaje}</div></div>}<Button variant="ghost" size="sm" className="-ml-2" onClick={()=>nav("/documentos/especificaciones")}><ArrowLeft/>Volver a especificaciones</Button>
 <Card className="border-t-4 border-t-slate-800"><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Badge variant="outline">{i.estadoVersion}</Badge><h1 className="mt-3 text-2xl font-semibold">{i.productoCodigo} · {i.productoDescripcion}</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{i.documentoCodigo} · Versión {fv(i.versionNumero)} · {i.versionInicioVigencia?"Vigencia "+fecha(i.versionInicioVigencia):"Sin fecha de vigencia"}</p></div><div className="flex flex-wrap items-center gap-2"><EtWorkflowActions info={i} busy={workflow.isPending} onAccion={(accion,comentario)=>workflow.mutate({accion,comentario})}/><Button variant={vista==="documento"?"default":"outline"} size="sm" onClick={()=>setVista("documento")}><FileText/>Vista estructurada</Button><Button variant={vista==="secciones"?"default":"outline"} size="sm" onClick={()=>setVista("secciones")}><Layers3/>Ver por secciones</Button><Button variant={vista==="pdf"?"default":"outline"} size="sm" onClick={()=>setVista("pdf")}><ExternalLink/>PDF original</Button></div></div></CardContent></Card>
 {vista==="documento"&&<EtDocumentPreview data={d}/>}
 {vista==="secciones"&&<Card><CardContent className="p-0"><div className="flex overflow-x-auto border-b px-3">{secs.map(s=><button key={s.versSeccId} onClick={()=>setSel(s.seccionId)} className={"whitespace-nowrap border-b-2 px-4 py-3 text-sm "+(act?.seccionId===s.seccionId?"border-amber-500 font-semibold":"border-transparent text-[var(--text-secondary)]")}>{title(s.seccionDescripcion)}</button>)}</div><div className="min-h-[260px] p-6">{act?<Contenido d={d} s={act}/>:<Vacio/>}</div></CardContent></Card>}
 {vista==="pdf"&&<Card><CardContent className="p-6">{i.archivoOriginalUrl?<div className="space-y-4"><div><h2 className="text-lg font-semibold">PDF oficial original</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{i.archivoOriginalNombre??"Documento oficial vinculado a esta versión."}</p></div><div className="overflow-hidden rounded-lg border bg-slate-100"><iframe title="PDF original" src={i.archivoOriginalUrl} className="h-[72vh] w-full bg-white"/></div><div className="flex justify-end"><Button variant="outline" onClick={()=>window.open(i.archivoOriginalUrl!,"_blank","noopener,noreferrer")}><ExternalLink/>Abrir PDF en otra pestaña</Button></div></div>:<div className="py-16 text-center"><FileText className="mx-auto size-10 text-slate-300"/><h2 className="mt-4 text-lg font-semibold">PDF original no vinculado</h2><p className="mx-auto mt-2 max-w-lg text-sm text-[var(--text-secondary)]">Esta versión todavía no tiene registrada la ruta o URL del archivo PDF oficial de Calidad. La vista estructurada continúa disponible con la información almacenada en la base de datos.</p></div>}</CardContent></Card>}
 </PageContainer>
}
function Contenido({d,s}:{d:DetalleEt;s:SeccionEt}){const n=norm(s.seccionDescripcion),i=d.informacionGeneral;
 if(n.includes("INFORMACION GENERAL"))return <B t="Información general"><div className="grid gap-5 md:grid-cols-4"><Info l="Código" v={i.documentoCodigo}/><Info l="Producto" v={i.productoCodigo}/><Info l="Versión" v={fv(i.versionNumero)}/><Info l="Páginas" v={String(i.versionNroPaginas??"—")}/></div></B>;
 if(n.includes("RESPONSABLE"))return <B t="Responsables">{d.responsables.length?<T h={["Responsabilidad","Responsable","Cargo","DNI"]} r={d.responsables.map(x=>[x.tipoResponsabilidad.replaceAll("_"," "),x.usuarioNombresApellidos,x.cargoDescripcion??"—",x.usuarioDni])}/>:<Vacio/>}</B>;
 if(n.includes("DESCRIPCION"))return <B t="Descripción"><Texto v={i.versionDescripcion}/></B>;
 if(n.includes("INGREDIENT"))return <B t="Ingredientes">{d.ingredientes.length?<T h={["Ingrediente","Cantidad","Unidad"]} r={[...d.ingredientes].sort(ord).map(x=>[x.ingredienteDescripcion,x.versIngrValor??"—",x.unidadDeMedida??"Sin medida"])}/>:<Vacio/>}</B>;
 if(n.includes("RECETA"))return <B t="Recetas"><Lista a={[...d.recetas].sort(ord).map(x=>x.recetaDescripcion)}/></B>;
 if(n.includes("PROCEDIMIENTO"))return <B t="Procedimientos"><Lista num a={[...d.procedimientos].sort(ord).map(x=>x.procPrepDescripcion)}/></B>;
 if(n.includes("TRATAMIENTO"))return <B t="Tratamientos"><Trat d={d}/></B>;
 if(n.includes("CARACTERIST"))return <B t="Características"><Cars a={d.caracteristicas}/></B>;
 if(n.includes("PRESENTACION")||n.includes("ENVASE"))return <B t="Presentación / Envases y embalajes"><Texto v={i.envyEmbDescripcion}/></B>;
 if(n.includes("ALMACENAMIENTO"))return <B t="Almacenamiento y distribución"><Texto v={i.almacyDistDescripcion}/></B>;
 if(n.includes("VIDA UTIL"))return <B t="Vida útil"><Texto v={i.vidaUtilDescripcion}/></B>;
 if(n.includes("DESCONGELAMIENTO"))return <B t="Descongelamiento"><Texto v={i.descongelamientoDescripcion}/></B>;
 if(n.includes("INSTRUCCION"))return <B t="Instrucciones"><Lista a={[...d.instrucciones].sort(ord).map(x=>x.instruccionDescripcion)}/></B>;
 if(n.includes("ROTULADO"))return <B t="Contenido del rotulado"><Lista a={[...d.contenidoRotulado].sort(ord).map(x=>x.contRotuladoDescripcion)}/></B>;
 if(n.includes("CAMBIO"))return <B t="Cambios de esta versión">{d.cambiosVersion.length?<T h={["Revisión","Fecha","Descripción"]} r={d.cambiosVersion.map(x=>[x.cambVersNumeroDeRevision,fecha(x.cambVersFechaDeActualizacion),x.cambVersDescripcion])}/>:<Vacio/>}</B>;
 if(n.includes("ANEX"))return <B t="Anexos"><Lista a={d.anexos.map(x=>x.anexoDescripcion)}/></B>;
 return <B t={s.seccionDescripcion}><Vacio/></B>}
function Cars({a}:{a:CaracteristicaEt[]}){
 const [tipo,setTipo]=useState("TODAS");
 if(!a.length)return <Vacio/>;
 const tipos=Array.from(new Set(a.map(x=>x.tipoCaracteristica))).filter(Boolean);
 const visibles=tipo==="TODAS"?a:a.filter(x=>x.tipoCaracteristica===tipo);
 return <div>
  <div className="mb-4 flex flex-wrap items-center gap-2">
   <span className="mr-1 text-xs font-medium text-[var(--text-secondary)]">Filtrar por tipo:</span>
   <button onClick={()=>setTipo("TODAS")} className={"rounded-full border px-3 py-1.5 text-xs font-medium transition "+(tipo==="TODAS"?"border-slate-900 bg-slate-900 text-white":"bg-white hover:bg-slate-50")}>Todas <span className="ml-1 opacity-70">{a.length}</span></button>
   {tipos.map(t=><button key={t} onClick={()=>setTipo(t)} className={"rounded-full border px-3 py-1.5 text-xs font-medium transition "+(tipo===t?"border-slate-900 bg-slate-900 text-white":"bg-white hover:bg-slate-50")}>{cap(t)} <span className="ml-1 opacity-70">{a.filter(x=>x.tipoCaracteristica===t).length}</span></button>)}
  </div>
  <T h={["Tipo","Característica","Obligatoria","Criterio","Especificación","Unidad","Método"]} r={[...visibles].sort((x,y)=>(x.tipoCaracteristica??"").localeCompare(y.tipoCaracteristica??"")||ord(x,y)).map(x=>[cap(x.tipoCaracteristica),x.caracteristica,x.esObligatorio?"Sí":"No",x.tipoCriterio??"—",spec(x),x.unidad??"N.A.",x.metodoEnsayo??"N.A."])}/>
 </div>
}
function Trat({d}:{d:DetalleEt}){const r=d.tratamientos.flatMap(t=>{const p=d.parametrosTratamiento.filter(x=>x.versTratConsId===t.versTratConsId);return p.length?p.sort(ord).map(x=>[t.tratConservDescripcion,x.paramTratDescripcion,x.tipoCriterio,valTrat(x)]):[[t.tratConservDescripcion,"—","—","—"]]});return r.length?<T h={["Tratamiento","Parámetro","Criterio","Valor"]} r={r}/>:<Vacio/>}
function B({t,children}:{t:string;children:React.ReactNode}){return <section><h2 className="mb-4 text-lg font-semibold">{t}</h2>{children}</section>}
function T({h,r}:{h:string[];r:React.ReactNode[][]}){return <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[var(--surface-muted)] text-left text-xs text-[var(--text-secondary)]"><tr>{h.map(x=><th key={x} className="px-3 py-2">{x}</th>)}</tr></thead><tbody>{r.map((x,i)=><tr key={i} className="border-b">{x.map((v,j)=><td key={j} className="px-3 py-2.5">{v}</td>)}</tr>)}</tbody></table></div>}
function Lista({a,num=false}:{a:string[];num?:boolean}){if(!a.length)return <Vacio/>;const C=num?"ol":"ul";return <C className={(num?"list-decimal ":"list-disc ")+"space-y-2 pl-6"}>{a.map((x,i)=><li key={i}>{x}</li>)}</C>}
function Texto({v}:{v?:string|null}){return v?<p className="whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">{v}</p>:<Vacio/>}
function Vacio(){return <p className="text-sm italic text-[var(--text-secondary)]">Sin información registrada en esta sección.</p>}
function Info({l,v}:{l:string;v:string}){return <div><p className="text-xs text-[var(--text-secondary)]">{l}</p><p className="mt-1 font-medium">{v}</p></div>}
function norm(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()} function title(v:string){return v.replace(/^\d+\.?\s*/,"").toLowerCase().replace(/(^|\s)\S/g,x=>x.toUpperCase())} function cap(v:string){return v.toLowerCase().replace(/(^|\s)\S/g,x=>x.toUpperCase())}
function fecha(v:string|null|undefined){return v?new Date(v).toLocaleDateString("es-PE"):"—"} function fv(v:number|null){return v==null?"—":String(v).padStart(2,"0")} function ord(a:{orden:number|null},b:{orden:number|null}){return(a.orden??999)-(b.orden??999)}
function spec(x:CaracteristicaEt){if(x.tipoCriterio==="MINIMO")return "≥ "+(x.valorCuantitativoInicial??"—");if(x.tipoCriterio==="MAXIMO")return "≤ "+(x.valorCuantitativoFinal??"—");if(x.tipoCriterio==="RANGO")return (x.valorCuantitativoInicial??"—")+" – "+(x.valorCuantitativoFinal??"—");return x.valorCualitativo??(x.tipoCriterio==="AUSENCIA"?"Ausencia":"—")}
function valTrat(x:DetalleEt["parametrosTratamiento"][number]){let v="—";if(x.tipoCriterio==="MINIMO")v="≥ "+(x.valorCuantitativoInicial??"—");else if(x.tipoCriterio==="MAXIMO")v="≤ "+(x.valorCuantitativoFinal??"—");else if(x.tipoCriterio==="RANGO")v=(x.valorCuantitativoInicial??"—")+" – "+(x.valorCuantitativoFinal??"—");else if(x.valorCuantitativoIgual!=null)v=String(x.valorCuantitativoIgual);else if(x.valorCualitativo)v=x.valorCualitativo;return v+(x.paramTratUnidadDeMedida?" "+x.paramTratUnidadDeMedida:"")}

function presentacionSecciones(raw:SeccionEt[]){const ordenadas=[...raw].sort((a,b)=>(a.orden??999)-(b.orden??999));const salida:SeccionEt[]=[];let caracteristicas:SeccionEt|null=null;for(const s of ordenadas){const n=norm(s.seccionDescripcion);if(n==="INCLUIR")continue;if(n.includes("CARACTERIST")){if(!caracteristicas)caracteristicas={...s,seccionDescripcion:"CARACTERÍSTICAS"};continue}salida.push(s)}if(caracteristicas)salida.push(caracteristicas);return salida.sort((a,b)=>(a.orden??999)-(b.orden??999))}
