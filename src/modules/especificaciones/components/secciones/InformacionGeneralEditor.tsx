import {Card,CardContent} from "@/components/ui/card";
import type {InformacionGeneralEt} from "../../types";

export default function InformacionGeneralEditor({info}:{info:InformacionGeneralEt}){
 return <Card><CardContent className="p-0"><div className="border-b px-5 py-4"><h2 className="font-semibold">Información general</h2><p className="text-xs text-[var(--text-secondary)]">Datos principales de la Especificación Técnica.</p></div>
  <div className="grid gap-4 p-5 md:grid-cols-2"><Dato label="Código ET" value={info.documentoCodigo}/><Dato label="Producto" value={`${info.productoCodigo} · ${info.productoDescripcion}`}/><Dato label="Descripción" value={info.documentoDescripcionDocumento}/><Dato label="Versión" value={String(info.versionNumero??"—")}/><Dato label="Inicio de vigencia" value={info.versionInicioVigencia?.slice(0,10)??"—"}/><Dato label="N.º páginas" value={String(info.versionNroPaginas??"—")}/></div>
  {info.permiteEditar&&<div className="border-t bg-amber-50/50 px-5 py-3 text-xs text-amber-800">Esta sección ya está separada como editor especializado. El siguiente paso es conectar sus campos editables al guardado de Información General.</div>}
 </CardContent></Card>
}
function Dato({label,value}:{label:string;value:string}){return <div><div className="text-xs font-medium text-[var(--text-secondary)]">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></div>}
