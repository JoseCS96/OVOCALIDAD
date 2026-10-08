import type {CaracteristicaEt,DetalleEt,SeccionEt} from "../types";

export default function EtDocumentPreview({data}:{data:DetalleEt}){
 const i=data.informacionGeneral;
 const secciones=documentSections(data.secciones);
 return <div className="w-full bg-white shadow-sm print:shadow-none">
  <article className="border border-slate-300 text-[13px] text-slate-900">
   <header className="grid grid-cols-[1fr_1.6fr_1fr] border-b border-slate-300">
    <div className="flex items-center px-5 py-4 text-2xl font-bold italic">Ovosur</div>
    <div className="border-x border-slate-300 px-4 py-3 text-center"><p className="text-xs font-semibold uppercase tracking-wider">Especificación técnica</p><h1 className="mt-1 text-base font-bold uppercase">{i.documentoDescripcionDocumento}</h1></div>
    <div className="grid grid-rows-3 text-xs"><Meta l="Código" v={i.documentoCodigo}/><Meta l="Versión" v={version(i.versionNumero)}/><Meta l="Vigencia" v={fecha(i.versionInicioVigencia)}/></div>
   </header>
   <div className="grid grid-cols-3 border-b border-slate-300">{["ELABORADO POR","REVISADO POR","APROBADO POR"].map(tipo=><div key={tipo} className="min-h-20 border-r border-slate-300 p-3 last:border-r-0"><p className="text-[10px] font-bold text-slate-500">{tipo}</p>{data.responsables.filter(x=>norm(x.tipoResponsabilidad).includes(tipo.split(" ")[0])).map(x=><div key={x.idRelacion} className="mt-1"><p className="text-xs font-medium">{x.usuarioNombresApellidos}</p>{x.cargoDescripcion&&<p className="text-[10px] leading-4 text-slate-500">{x.cargoDescripcion}</p>}</div>)}</div>)}</div>
   <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_320px]">
    <main className="min-w-0 px-8 py-5">
     {secciones.map((s,index)=><Section key={s.versSeccId} id={"et-seccion-"+(index+1)} t={sectionTitle(s.seccionDescripcion)}><SectionContent data={data} seccion={s}/></Section>)}
    </main>

    <aside className="hidden self-stretch border-l border-slate-200 bg-slate-50/70 lg:block print:hidden">
     <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto p-5">
      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resumen documental</p><div className="mt-3 space-y-2 text-xs"><SideMeta l="Estado" v={i.estadoVersion}/><SideMeta l="Código" v={i.documentoCodigo}/><SideMeta l="Versión" v={version(i.versionNumero)}/><SideMeta l="Vigencia" v={fecha(i.versionInicioVigencia)}/></div></div>
      <div className="border-t border-slate-200 pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Documento original</p>{i.archivoOriginalUrl?<button type="button" onClick={()=>window.open(i.archivoOriginalUrl!,"_blank","noopener,noreferrer")} className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100">Abrir PDF oficial ↗</button>:<p className="mt-2 text-xs leading-5 text-slate-500">PDF oficial todavía no vinculado a esta versión.</p>}</div>
      <div className="border-t border-slate-200 pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Navegación</p><nav className="mt-2 space-y-0.5">{secciones.map((s,index)=>{const x={n:String(index+1),t:sectionTitle(s.seccionDescripcion)};return <button key={x.n} type="button" onClick={()=>document.getElementById("et-seccion-"+x.n)?.scrollIntoView({behavior:"smooth",block:"start"})} className="block w-full rounded px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-white hover:text-slate-950">{x.t}</button>})}</nav></div>
     </div>
    </aside>
   </div>
   <footer className="border-t border-slate-300 px-7 py-3 text-[10px] text-slate-500">Documento estructurado desde OVOCALIDAD · {i.documentoCodigo} · V{version(i.versionNumero)}</footer>
  </article>
 </div>
}
function SectionContent({data,seccion}:{data:DetalleEt;seccion:SeccionEt}){const n=norm(seccion.seccionDescripcion),i=data.informacionGeneral;
 if(n.includes("RESPONSABLE"))return data.responsables.length?<div className="space-y-3">
  {[
   ["ELABORADO POR","ELABORADO"],
   ["REVISADO POR","REVISADO"],
   ["APROBADO POR","APROBADO"]
  ].map(([titulo,tipo])=>{
   const items=data.responsables.filter(x=>norm(x.tipoResponsabilidad).includes(tipo));
   if(!items.length)return null;
   return <div key={tipo} className="break-inside-avoid">
    <p className="mb-1 text-[11px] font-bold uppercase text-slate-600">{titulo}</p>
    <div className="space-y-1 pl-3">
     {items.map(x=><div key={x.idRelacion} className="text-slate-700">
      <span className="font-medium">{x.usuarioNombresApellidos}</span>
      {x.cargoDescripcion&&<span className="text-slate-500"> — {x.cargoDescripcion}</span>}
     </div>)}
    </div>
   </div>;
  })}
 </div>:<Empty/>;
 if(n.includes("DESCRIPCION"))return <Text v={i.versionDescripcion}/>;
 if(n.includes("INGREDIENT"))return data.ingredientes.length?<table className="doc-table"><thead><tr><Th>Ingrediente</Th><Th>Cantidad</Th><Th>Unidad</Th></tr></thead><tbody>{[...data.ingredientes].sort(ord).map(x=><tr key={x.versIngrId}><Td>{x.ingredienteDescripcion}</Td><Td>{x.versIngrValor??"—"}</Td><Td>{x.unidadDeMedida??"—"}</Td></tr>)}</tbody></table>:<Empty/>;
 if(n.includes("RECETA"))return <List a={[...data.recetas].sort(ord).map(x=>x.recetaDescripcion)}/>;
 if(n.includes("PROCEDIMIENTO"))return <List a={[...data.procedimientos].sort(ord).map(x=>x.procPrepDescripcion)} ordered/>;
 if(n.includes("TRATAMIENTO"))return data.tratamientos.length?<div className="space-y-2 pl-4">{data.tratamientos.map(t=><div key={t.versTratConsId}><p className="font-semibold">{t.tratConservDescripcion}</p>{data.parametrosTratamiento.filter(x=>x.versTratConsId===t.versTratConsId).map(x=><p key={x.versParamTratId} className="ml-4 mt-1 text-slate-700">• {x.paramTratDescripcion}: {trat(x)}</p>)}</div>)}</div>:<Empty/>;
 if(n.includes("CARACTERIST"))return <Caracteristicas a={data.caracteristicas}/>;
 if(n.includes("PRESENTACION")||n.includes("ENVASE"))return <Text v={i.envyEmbDescripcion}/>;
 if(n.includes("ALMACENAMIENTO"))return <Text v={i.almacyDistDescripcion}/>;
 if(n.includes("VIDA UTIL"))return <Text v={i.vidaUtilDescripcion}/>;
 if(n.includes("DESCONGELAMIENTO"))return <Text v={i.descongelamientoDescripcion}/>;
 if(n.includes("INSTRUCCION"))return <List a={[...data.instrucciones].sort(ord).map(x=>x.instruccionDescripcion)}/>;
 if(n.includes("ROTULADO"))return <List a={[...data.contenidoRotulado].sort(ord).map(x=>x.contRotuladoDescripcion)}/>;
 if(n.includes("CAMBIO"))return data.cambiosVersion.length?<table className="doc-table"><thead><tr><Th>Revisión</Th><Th>Fecha</Th><Th>Descripción</Th></tr></thead><tbody>{data.cambiosVersion.map(x=><tr key={x.versCambId}><Td>{x.cambVersNumeroDeRevision}</Td><Td>{fecha(x.cambVersFechaDeActualizacion)}</Td><Td>{x.cambVersDescripcion}</Td></tr>)}</tbody></table>:<Empty/>;
 if(n.includes("ANEX"))return <List a={data.anexos.map(x=>x.anexoDescripcion)}/>;
 return <Empty/>;
}
function documentSections(raw:SeccionEt[]){return [...raw].filter(s=>{const n=norm(s.seccionDescripcion);return n!=="INCLUIR"&&!n.includes("INFORMACION GENERAL")}).sort((a,b)=>(a.orden??999)-(b.orden??999))}
function sectionTitle(v:string){return v.replace(/^\d+\.?\s*/,"").trim()}

function Caracteristicas({a}:{a:CaracteristicaEt[]}){if(!a.length)return <Empty/>;const fases=Array.from(new Map(a.map(x=>[x.faseId??`SIN-${x.fase??"FASE"}`,{id:x.faseId,nombre:x.fase??x.faseCodigo??"Sin fase"}])).values());return <div className="space-y-5">{fases.map(f=>{const porFase=a.filter(x=>f.id!=null?x.faseId===f.id:(x.fase??x.faseCodigo??"Sin fase")===f.nombre),tipos=Array.from(new Set(porFase.map(x=>x.tipoCaracteristica)));return <div key={f.id??f.nombre} className="break-inside-avoid"><div className="mb-2 border-l-4 border-slate-700 bg-slate-50 px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Fase</p><p className="font-bold">{f.nombre}</p></div><div className="space-y-4">{tipos.map(g=><div key={g}><p className="mb-1.5 font-bold capitalize">{g.toLowerCase()}</p><table className="doc-table"><thead><tr><Th>Característica</Th><Th>Especificación</Th><Th>Unidad</Th><Th>Método</Th></tr></thead><tbody>{porFase.filter(x=>x.tipoCaracteristica===g).sort(ord).map(x=><tr key={x.versCaractId}><Td>{x.caracteristica}</Td><Td>{spec(x)}</Td><Td>{x.unidad??"N.A."}</Td><Td>{x.metodoEnsayo??"N.A."}</Td></tr>)}</tbody></table></div>)}</div></div>})}</div>}
function Section({id,t,children}:{id?:string;t:string;children:React.ReactNode}){return <section id={id} className="mb-4 scroll-mt-24 break-inside-avoid"><h2 className="mb-2 border-b border-slate-300 pb-1 pl-2 text-sm font-bold uppercase">{t}</h2>{children}</section>}
function SideMeta({l,v}:{l:string;v:string}){return <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2"><span className="text-slate-500">{l}</span><span className="text-right font-semibold">{v}</span></div>}
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
function spec(x:CaracteristicaEt){if(x.tipoCriterio==="MINIMO")return "≥ "+(x.valorCuantitativoInicial??"—");if(x.tipoCriterio==="MAXIMO")return "≤ "+(x.valorCuantitativoFinal??"—");if(x.tipoCriterio==="MAYOR_QUE")return "> "+(x.valorCuantitativoInicial??"—");if(x.tipoCriterio==="MENOR_QUE")return "< "+(x.valorCuantitativoFinal??"—");if(x.tipoCriterio==="RANGO")return (x.valorCuantitativoInicial??"—")+" – "+(x.valorCuantitativoFinal??"—");if(x.tipoCriterio==="IGUAL")return String(x.valorCuantitativoIgual??x.valorCualitativo??"—");return x.valorCualitativo??(x.tipoCriterio==="AUSENCIA"?"Ausencia":"—")}
function trat(x:DetalleEt["parametrosTratamiento"][number]){let v="—";if(x.tipoCriterio==="MINIMO")v="≥ "+(x.valorCuantitativoInicial??"—");else if(x.tipoCriterio==="MAXIMO")v="≤ "+(x.valorCuantitativoFinal??"—");else if(x.tipoCriterio==="RANGO")v=(x.valorCuantitativoInicial??"—")+" – "+(x.valorCuantitativoFinal??"—");else if(x.valorCuantitativoIgual!=null)v=String(x.valorCuantitativoIgual);else if(x.valorCualitativo)v=x.valorCualitativo;const minutos=x.paramTratDescripcion.trim().toLowerCase()==="tiempo"&&x.paramTratUnidadDeMedida?.trim().toLowerCase()==="minutos";const valor=x.tipoCriterio==="MINIMO"?x.valorCuantitativoInicial:x.tipoCriterio==="MAXIMO"?x.valorCuantitativoFinal:x.valorCuantitativoIgual;const dias=minutos&&valor!=null&&valor>=1440&&valor%1440===0?` (equivalente a ${valor/1440} ${valor===1440?"día":"días"})`:"";return v+(x.paramTratUnidadDeMedida?" "+x.paramTratUnidadDeMedida:"")+dias}
