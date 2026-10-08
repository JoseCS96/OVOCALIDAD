import type {CertificadoVista} from "../types";

function parseJson<T=Record<string,unknown>>(value:string|null):T|null{
 if(!value)return null;
 try{return JSON.parse(value) as T}catch{return null}
}

export default function CertificadoDocumento({data}:{data:CertificadoVista}){
 const {cabecera,secciones,resultados}=data;
 const ordenadas=[...secciones].sort((a,b)=>a.ordenSeccion-b.ordenSeccion);
 const resultadosPorInforme=Array.from(new Map(resultados.map(r=>[r.ordenInforme,{titulo:r.tituloInforme,orden:r.ordenInforme}])).values()).sort((a,b)=>a.orden-b.orden);

 return <article className="mx-auto w-full max-w-[1000px] bg-white text-slate-900 shadow-sm print:max-w-none print:shadow-none">
  <div className="border border-slate-300">
   {ordenadas.map(s=>{
    if(s.tipoSeccion==="RESULTADOS")return <section key={s.ordenSeccion} className="border-b border-slate-300 p-5 last:border-b-0">
      <h2 className="mb-4 text-base font-bold uppercase">{s.tituloSeccion??"Resultados"}</h2>
      <div className="space-y-5">{resultadosPorInforme.map(i=>{
       const filas=resultados.filter(r=>r.ordenInforme===i.orden).sort((a,b)=>a.ordenDetalle-b.ordenDetalle);
       return <div key={i.orden} className="break-inside-avoid">
        <h3 className="mb-2 font-semibold">{i.titulo}</h3>
        <table className="w-full border-collapse text-sm">
         <thead><tr className="bg-slate-50"><Th>Determinación</Th><Th>Resultado</Th><Th>Especificación</Th><Th>Unidad</Th><Th>Método</Th></tr></thead>
         <tbody>{filas.map((r,idx)=><tr key={idx}><Td>{r.determinacion}</Td><Td>{r.resultado??"—"}</Td><Td>{r.especificacion??"—"}</Td><Td>{r.unidadDeMedida??"—"}</Td><Td>{r.metodoEnsayo??"—"}</Td></tr>)}</tbody>
        </table>
       </div>
      })}</div>
     </section>;

    if(s.tipoSeccion==="ENCABEZADO"){
      const x=parseJson<{titulo?:string;subtitulo?:string}>(s.contenido);
      return <header key={s.ordenSeccion} className="grid grid-cols-[1fr_2fr_1fr] border-b border-slate-300">
       <div className="flex items-center px-5 py-4 text-2xl font-bold italic">Ovosur</div>
       <div className="border-x border-slate-300 px-4 py-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide">{x?.titulo??"ASEGURAMIENTO DE LA CALIDAD"}</div>
        <div className="mt-1 text-lg font-bold uppercase">{x?.subtitulo??"CERTIFICADO DE ANÁLISIS"}</div>
       </div>
       <div className="grid text-xs"><Meta l="N°" v={cabecera.numeroCertificado??"Previsualización"}/><Meta l="FT" v={cabecera.documentoCodigo}/><Meta l="Fecha" v={new Date(cabecera.fechaEmision).toLocaleDateString("es-PE")}/></div>
      </header>;
    }

    return <section key={s.ordenSeccion} className="border-b border-slate-300 p-5 last:border-b-0">
     <h2 className="mb-3 text-sm font-bold uppercase">{s.tituloSeccion}</h2>
     <Contenido tipo={s.tipoSeccion} contenido={s.contenido} cabecera={cabecera}/>
    </section>
   })}
  </div>
 </article>;
}

function Contenido({tipo,contenido,cabecera}:{tipo:string;contenido:string|null;cabecera:CertificadoVista["cabecera"]}){
 const obj=parseJson<Record<string,unknown>>(contenido);
 if(tipo==="DATOS_EMPRESA"&&obj)return <div className="grid gap-2 text-sm md:grid-cols-2">{Object.entries(obj).filter(([,v])=>v!=null&&String(v).trim()!=="").map(([k,v])=><Dato key={k} l={etiqueta(k)} v={String(v)}/>)}</div>;
 if(tipo==="PRODUCTO"&&obj)return <div className="grid gap-2 text-sm md:grid-cols-2">{Object.entries(obj).filter(([,v])=>v!=null).map(([k,v])=><Dato key={k} l={etiqueta(k)} v={String(v)}/>)}</div>;
 if(tipo==="DATOS_LOTE"&&obj)return <div className="grid gap-2 text-sm md:grid-cols-2">{Object.entries(obj).filter(([,v])=>v!=null).map(([k,v])=><Dato key={k} l={etiqueta(k)} v={k.toLowerCase().includes("fecha")?new Date(String(v)).toLocaleString("es-PE"):String(v)}/>)}</div>;
 if(tipo==="FIRMA"&&obj)return <div className="mt-8 flex justify-end"><div className="min-w-[280px] border-t border-slate-500 pt-2 text-center text-sm"><div className="font-medium">{String(obj.responsable??"[Responsable]")}</div><div className="text-slate-500">{String(obj.cargo??"[Cargo]")}</div><div className="mt-1 text-xs text-slate-500">{obj.fecha?new Date(String(obj.fecha)).toLocaleString("es-PE"):""}</div></div></div>;
 if(contenido)return <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{contenido}</p>;
 if(tipo==="PRODUCTO")return <p className="text-sm">{cabecera.productoCodigo} · {cabecera.productoDescripcion}</p>;
 return <p className="text-sm italic text-slate-400">Sin contenido.</p>;
}

function etiqueta(v:string){return v.replace(/([A-Z])/g," $1").replace(/^./,x=>x.toUpperCase())}
function Dato({l,v}:{l:string;v:string}){return <div><span className="font-semibold">{l}:</span> {v}</div>}
function Meta({l,v}:{l:string;v:string}){return <div className="flex items-center justify-between gap-2 border-b border-slate-300 px-3 py-2 last:border-b-0"><b>{l}</b><span className="text-right">{v}</span></div>}
function Th({children}:{children:React.ReactNode}){return <th className="border border-slate-300 px-2 py-2 text-left text-xs">{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td className="border border-slate-300 px-2 py-2 align-top">{children}</td>}
