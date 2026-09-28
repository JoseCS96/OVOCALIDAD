import type {CaracteristicaEt,DetalleEt} from "../types";

export default function EtDocumentPreview({data}:{data:DetalleEt}){
 const i=data.informacionGeneral;
 return <div className="w-full bg-white shadow-sm print:shadow-none">
  <article className="border border-slate-300 text-[13px] text-slate-900">
   <header className="grid grid-cols-[1fr_1.6fr_1fr] border-b border-slate-300">
    <div className="flex items-center px-5 py-4 text-2xl font-bold italic">Ovosur</div>
    <div className="border-x border-slate-300 px-4 py-3 text-center"><p className="text-xs font-semibold uppercase tracking-wider">Especificación técnica</p><h1 className="mt-1 text-base font-bold uppercase">{i.documentoDescripcionDocumento}</h1></div>
    <div className="grid grid-rows-3 text-xs"><Meta l="Código" v={i.documentoCodigo}/><Meta l="Versión" v={version(i.versionNumero)}/><Meta l="Vigencia" v={fecha(i.versionInicioVigencia)}/></div>
   </header>
   <div className="grid grid-cols-3 border-b border-slate-300">{["ELABORADO POR","REVISADO POR","APROBADO POR"].map(tipo=><div key={tipo} className="min-h-20 border-r border-slate-300 p-3 last:border-r-0"><p className="text-[10px] font-bold text-slate-500">{tipo}</p>{data.responsables.filter(x=>norm(x.tipoResponsabilidad).includes(tipo.split(" ")[0])).map(x=><p key={x.idRelacion} className="mt-1 text-xs font-medium">{x.usuarioNombresApellidos}</p>)}</div>)}</div>
   <main className="w-1/2 px-8 py-5">
    <Section n="1" t="Descripción"><Text v={i.versionDescripcion}/></Section>
    <Section n="2" t="Ingredientes">{data.ingredientes.length?<table className="doc-table"><thead><tr><Th>Ingrediente</Th><Th>Cantidad</Th><Th>Unidad</Th></tr></thead><tbody>{[...data.ingredientes].sort(ord).map(x=><tr key={x.versIngrId}><Td>{x.ingredienteDescripcion}</Td><Td>{x.versIngrValor??"—"}</Td><Td>{x.unidadDeMedida??"—"}</Td></tr>)}</tbody></table>:<Empty/>}</Section>
    <Section n="3" t="Recetas"><List a={[...data.recetas].sort(ord).map(x=>x.recetaDescripcion)}/></Section>
    <Section n="4" t="Procedimientos"><List a={[...data.procedimientos].sort(ord).map(x=>x.procPrepDescripcion)} ordered/></Section>
    <Section n="5" t="Tratamientos">{data.tratamientos.length?<div className="space-y-2 pl-4">{data.tratamientos.map(t=><div key={t.versTratConsId}><p className="font-semibold">{t.tratConservDescripcion}</p>{data.parametrosTratamiento.filter(x=>x.versTratConsId===t.versTratConsId).map(x=><p key={x.versParamTratId} className="ml-4 mt-1 text-slate-700">• {x.paramTratDescripcion}: {trat(x)}</p>)}</div>)}</div>:<Empty/>}</Section>
    <Section n="6" t="Características"><Caracteristicas a={data.caracteristicas}/></Section>
    <Section n="7" t="Presentación y características de envases y embalajes"><Text v={i.envyEmbDescripcion}/></Section>
    <Section n="8" t="Condiciones de almacenamiento y distribución"><Text v={i.almacyDistDescripcion}/></Section>
    <Section n="9" t="Tiempo de vida útil"><Text v={i.vidaUtilDescripcion}/></Section>
    {i.descongelamientoDescripcion&&<Section n="10" t="Descongelamiento"><Text v={i.descongelamientoDescripcion}/></Section>}
    <Section n="11" t="Instrucciones"><List a={[...data.instrucciones].sort(ord).map(x=>x.instruccionDescripcion)}/></Section>
    <Section n="12" t="Contenido del rotulado"><List a={[...data.contenidoRotulado].sort(ord).map(x=>x.contRotuladoDescripcion)}/></Section>
    <Section n="13" t="Cambios de esta versión">{data.cambiosVersion.length?<table className="doc-table"><thead><tr><Th>Revisión</Th><Th>Fecha</Th><Th>Descripción</Th></tr></thead><tbody>{data.cambiosVersion.map(x=><tr key={x.versCambId}><Td>{x.cambVersNumeroDeRevision}</Td><Td>{fecha(x.cambVersFechaDeActualizacion)}</Td><Td>{x.cambVersDescripcion}</Td></tr>)}</tbody></table>:<Empty/>}</Section>
    {data.anexos.length>0&&<Section n="14" t="Anexos"><List a={data.anexos.map(x=>x.anexoDescripcion)}/></Section>}
   </main>
   <footer className="border-t border-slate-300 px-7 py-3 text-[10px] text-slate-500">Documento estructurado desde OVOCALIDAD · {i.documentoCodigo} · V{version(i.versionNumero)}</footer>
  </article>
 </div>
}
function Caracteristicas({a}:{a:CaracteristicaEt[]}){if(!a.length)return <Empty/>;const grupos=Array.from(new Set(a.map(x=>x.tipoCaracteristica)));return <div className="space-y-4">{grupos.map(g=><div key={g}><p className="mb-1.5 font-bold capitalize">{g.toLowerCase()}</p><table className="doc-table"><thead><tr><Th>Característica</Th><Th>Especificación</Th><Th>Unidad</Th><Th>Método</Th></tr></thead><tbody>{a.filter(x=>x.tipoCaracteristica===g).sort(ord).map(x=><tr key={x.versCaractId}><Td>{x.caracteristica}</Td><Td>{spec(x)}</Td><Td>{x.unidad??"N.A."}</Td><Td>{x.metodoEnsayo??"N.A."}</Td></tr>)}</tbody></table></div>)}</div>}
function Section({n,t,children}:{n:string;t:string;children:React.ReactNode}){return <section className="mb-4 break-inside-avoid"><h2 className="mb-2 border-b border-slate-300 pb-1 pl-2 text-sm font-bold uppercase">{n}. {t}</h2>{children}</section>}
function Meta({l,v}:{l:string;v:string}){return <div className="flex items-center justify-between border-b border-slate-300 px-3 last:border-b-0"><span className="font-semibold">{l}</span><span>{v}</span></div>}
function Th({children}:{children:React.ReactNode}){return <th className="border border-slate-300 bg-slate-100 px-2 py-1.5 text-left text-[11px] font-bold">{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td className="border border-slate-300 px-2 py-1.5 align-top">{children}</td>}
function Text({v}:{v?:string|null}){return v?<p className="whitespace-pre-line pl-4 leading-5 text-slate-700">{v}</p>:<Empty/>}
function List({a,ordered=false}:{a:string[];ordered?:boolean}){if(!a.length)return <Empty/>;const C=ordered?"ol":"ul";return <C className={(ordered?"list-decimal ":"list-disc ")+"space-y-1 pl-8 text-slate-700"}>{a.map((x,i)=><li key={i} className="whitespace-pre-line">{x}</li>)}</C>}
function Empty(){return <p className="italic text-slate-400">Sin información registrada.</p>}
function norm(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()}
function fecha(v:string|null|undefined){return v?new Date(v).toLocaleDateString("es-PE"):"—"}
function version(v:number|null){return v==null?"—":String(v).padStart(2,"0")}
function ord(a:{orden:number|null},b:{orden:number|null}){return(a.orden??999)-(b.orden??999)}
function spec(x:CaracteristicaEt){if(x.tipoCriterio==="MINIMO")return "≥ "+(x.valorCuantitativoInicial??"—");if(x.tipoCriterio==="MAXIMO")return "≤ "+(x.valorCuantitativoFinal??"—");if(x.tipoCriterio==="RANGO")return (x.valorCuantitativoInicial??"—")+" – "+(x.valorCuantitativoFinal??"—");if(x.tipoCriterio==="IGUAL")return String(x.valorCuantitativoIgual??x.valorCualitativo??"—");return x.valorCualitativo??(x.tipoCriterio==="AUSENCIA"?"Ausencia":"—")}
function trat(x:DetalleEt["parametrosTratamiento"][number]){let v="—";if(x.tipoCriterio==="MINIMO")v="≥ "+(x.valorCuantitativoInicial??"—");else if(x.tipoCriterio==="MAXIMO")v="≤ "+(x.valorCuantitativoFinal??"—");else if(x.tipoCriterio==="RANGO")v=(x.valorCuantitativoInicial??"—")+" – "+(x.valorCuantitativoFinal??"—");else if(x.valorCuantitativoIgual!=null)v=String(x.valorCuantitativoIgual);else if(x.valorCualitativo)v=x.valorCualitativo;return v+(x.paramTratUnidadDeMedida?" "+x.paramTratUnidadDeMedida:"")}
