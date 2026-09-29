import {useEffect,useState} from "react";
import {Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import type {GuardarContenidoBaseEt,TipoContenidoBaseEt} from "../../types";

type Props={
 titulo:string;
 tipoContenido:TipoContenidoBaseEt;
 valor:string|null|undefined;
 editable:boolean;
 guardando:boolean;
 maxLength:number;
 onGuardar:(request:GuardarContenidoBaseEt)=>void;
};

export default function ContenidoBaseEditor({titulo,tipoContenido,valor,editable,guardando,maxLength,onGuardar}:Props){
 const [contenido,setContenido]=useState(valor??"");
 useEffect(()=>setContenido(valor??""),[valor,tipoContenido]);

 return <Card><CardContent className="p-0">
  <div className="border-b px-5 py-4">
   <h2 className="font-semibold">{titulo}</h2>
   <p className="text-xs text-[var(--text-secondary)]">Contenido de esta sección para la versión actual de la ET.</p>
  </div>
  <div className="space-y-3 p-5">
   <textarea
    className="min-h-52 w-full resize-y rounded-lg border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
    value={contenido}
    disabled={!editable||guardando}
    maxLength={maxLength}
    onChange={e=>setContenido(e.target.value)}
    placeholder={`Ingrese ${titulo.toLowerCase()}...`}
   />
   <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-[var(--text-secondary)]">{contenido.length} / {maxLength}</span>
    <Button disabled={!editable||guardando} onClick={()=>onGuardar({tipoContenido,contenido:contenido.trim()||null})}>
     <Save/>{guardando?"Guardando...":"Guardar cambios"}
    </Button>
   </div>
  </div>
 </CardContent></Card>
}
