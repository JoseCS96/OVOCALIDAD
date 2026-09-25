import {useEffect,useState} from "react";
import {Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import type {GuardarInformacionGeneralEt,InformacionGeneralEt,ProductoEt} from "../../types";

type Props={info:InformacionGeneralEt;productos:ProductoEt[];guardando:boolean;onGuardar:(request:GuardarInformacionGeneralEt)=>void};
export default function InformacionGeneralEditor({info,productos,guardando,onGuardar}:Props){
 const [form,setForm]=useState<GuardarInformacionGeneralEt>(()=>toForm(info));
 useEffect(()=>setForm(toForm(info)),[info]);
 const set=<K extends keyof GuardarInformacionGeneralEt>(k:K,v:GuardarInformacionGeneralEt[K])=>setForm(x=>({...x,[k]:v}));
 return <div className="rounded-xl border bg-white">
  <div className="border-b px-5 py-4"><h2 className="font-semibold">Información general</h2><p className="text-xs text-[var(--text-secondary)]">Edita los datos principales de la Especificación Técnica.</p></div>
  <div className="grid gap-5 p-5 md:grid-cols-2">
   <Field label="Código ET"><Input value={info.documentoCodigo} disabled/><Hint>El código identifica al documento y no se modifica desde esta sección.</Hint></Field>
   <Field label="Producto"><select className="h-9 w-full rounded-lg border bg-white px-3 text-sm" value={form.productoCodigo} onChange={e=>set("productoCodigo",e.target.value)}>{productos.map(x=><option key={x.productoCodigo} value={x.productoCodigo}>{x.productoCodigo} · {x.productoDescripcion}</option>)}</select></Field>
   <Field label="Nombre / descripción del documento"><Input value={form.documentoDescripcionDocumento} onChange={e=>set("documentoDescripcionDocumento",e.target.value)}/></Field>
   <Field label="Versión"><Input type="number" min="0" step="0.0001" value={form.versionNumero??""} onChange={e=>set("versionNumero",e.target.value===""?null:Number(e.target.value))}/></Field>
   <Field label="Inicio de vigencia"><Input type="date" value={form.versionInicioVigencia??""} onChange={e=>set("versionInicioVigencia",e.target.value||null)}/></Field>
   <Field label="N.º páginas"><Input type="number" min="1" value={form.versionNroPaginas??""} onChange={e=>set("versionNroPaginas",e.target.value===""?null:Number(e.target.value))}/></Field>
   <div className="md:col-span-2"><Field label="Descripción general"><textarea className="min-h-28 w-full resize-y rounded-lg border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200" value={form.versionDescripcion??""} onChange={e=>set("versionDescripcion",e.target.value||null)} placeholder="Descripción general de la versión..."/></Field></div>
  </div>
  <div className="flex items-center justify-between border-t bg-slate-50/60 px-5 py-4"><span className="text-xs text-[var(--text-secondary)]">Disponible mientras la ET esté en borrador u observada.</span><Button disabled={guardando||!form.documentoDescripcionDocumento.trim()||!form.productoCodigo} onClick={()=>onGuardar(form)}><Save/>{guardando?"Guardando...":"Guardar cambios"}</Button></div>
 </div>
}
function toForm(info:InformacionGeneralEt):GuardarInformacionGeneralEt{return {documentoDescripcionDocumento:info.documentoDescripcionDocumento,productoCodigo:info.productoCodigo,versionNumero:info.versionNumero,versionInicioVigencia:info.versionInicioVigencia?.slice(0,10)??null,versionReemplazaAId:info.versionReemplazaAId,versionNroPaginas:info.versionNroPaginas,versionDescripcion:info.versionDescripcion,usuario:"USUARIO_WEB"}}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block space-y-1.5"><span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>{children}</label>}
function Hint({children}:{children:React.ReactNode}){return <span className="block text-[11px] text-[var(--text-secondary)]">{children}</span>}
