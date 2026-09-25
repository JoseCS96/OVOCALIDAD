import {ArrowLeft,Save} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import type {InformacionGeneralEt} from "../types";

type Props={info:InformacionGeneralEt;guardando:boolean;ultimoGuardado:Date|null;confirmando:boolean;onVolver:()=>void;onGuardarBorrador:()=>void};
export default function EtEditorHeader({info,guardando,ultimoGuardado,confirmando,onVolver,onGuardarBorrador}:Props){
 return <div className="flex items-start justify-between gap-4">
  <div><Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={onVolver}><ArrowLeft/>Especificaciones</Button>
   <div className="flex items-center gap-3"><h1 className="text-2xl font-semibold">{info.documentoCodigo}</h1><Badge variant="outline">{info.estadoVersion}</Badge></div>
   <p className="mt-1 text-sm text-[var(--text-secondary)]">{info.documentoDescripcionDocumento} · {info.productoCodigo} {info.productoDescripcion}</p>
  </div>
  <div className="flex items-center gap-3"><div className="text-right text-xs text-[var(--text-secondary)]">{guardando?"Guardando cambios...":ultimoGuardado?`Cambios guardados · ${ultimoGuardado.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})}`:"Autoguardado activo"}</div>
   <Button className="h-11 bg-slate-900 px-5 text-base font-semibold text-white shadow-md hover:bg-slate-800 hover:shadow-lg" disabled={!info.permiteEditar||confirmando||guardando} onClick={onGuardarBorrador}><Save className="size-5"/>{confirmando?"Confirmando...":"Guardar borrador"}</Button>
   <div className="text-right text-xs text-[var(--text-secondary)]">Versión<div className="text-lg font-semibold text-[var(--text)]">{info.versionNumero??"—"}</div></div>
  </div>
 </div>
}