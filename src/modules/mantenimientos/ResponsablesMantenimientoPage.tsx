import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {BriefcaseBusiness,CirclePlus,FileImage,History,Pencil,Power,Search,Trash2,Upload,X} from "lucide-react";
import {Button} from "@/components/ui/button";import {Card,CardContent} from "@/components/ui/card";import {Input} from "@/components/ui/input";
import {agregarCargoHistoricoResponsable,editarCargoHistoricoResponsable,cambiarCargoResponsable,cambiarEstadoResponsable,crearResponsable,editarResponsable,eliminarFirmaResponsable,eliminarResponsable,guardarFirmaResponsable,listarCargosActivos,listarResponsables,obtenerFirmaResponsable,obtenerHistorialCargosResponsable,obtenerVinculoResponsableUsuario,vincularResponsableUsuario,type CargoActivo,type HistorialCargoResponsable,type ResponsableMaestro} from "./api";
type Filtro="todos"|"activos"|"inactivos"; type Modal="nuevo"|"editar"|"cargo"|"historial"|"historial-form"|"firma"|null;
export default function ResponsablesMantenimientoPage(){
 const [items,setItems]=useState<ResponsableMaestro[]>([]),[cargos,setCargos]=useState<CargoActivo[]>([]),[busqueda,setBusqueda]=useState(""),[filtro,setFiltro]=useState<Filtro>("todos"),[cargando,setCargando]=useState(true);
 const [modal,setModal]=useState<Modal>(null),[sel,setSel]=useState<ResponsableMaestro|null>(null),[dni,setDni]=useState(""),[nombre,setNombre]=useState(""),[cargoId,setCargoId]=useState<number|undefined>(),[cargoBusqueda,setCargoBusqueda]=useState(""),[cargoAbierto,setCargoAbierto]=useState(false),[fecha,setFecha]=useState(""),[historial,setHistorial]=useState<HistorialCargoResponsable[]>([]),[histEditando,setHistEditando]=useState<HistorialCargoResponsable|null>(null),[histFechaInicio,setHistFechaInicio]=useState(""),[histFechaFin,setHistFechaFin]=useState(""),[error,setError]=useState(""),[guardando,setGuardando]=useState(false);
 const cargoComboRef=useRef<HTMLDivElement|null>(null);
 const [firmaArchivo,setFirmaArchivo]=useState<File|null>(null),[firmaPreview,setFirmaPreview]=useState<string|null>(null),[firmaCargando,setFirmaCargando]=useState(false),[usuarioAcceso,setUsuarioAcceso]=useState(""),[vinculando,setVinculando]=useState(false),[generandoFirmaDni,setGenerandoFirmaDni]=useState<string|null>(null),[mensaje,setMensaje]=useState("");
 const cargar=useCallback(async()=>{setCargando(true);try{setItems(await listarResponsables({busqueda:busqueda.trim()||undefined,estado:filtro==="todos"?undefined:filtro==="activos"}))}finally{setCargando(false)}},[busqueda,filtro]);
 useEffect(()=>{const t=setTimeout(cargar,250);return()=>clearTimeout(t)},[cargar]);
 useEffect(()=>{listarCargosActivos().then(setCargos)},[]);
 useEffect(()=>{
  if(!cargoAbierto)return;
  const cerrarFuera=(e:MouseEvent)=>{if(cargoComboRef.current&&!cargoComboRef.current.contains(e.target as Node))setCargoAbierto(false)};
  const cerrarEsc=(e:KeyboardEvent)=>{if(e.key==="Escape"){e.preventDefault();setCargoAbierto(false)}};
  document.addEventListener("mousedown",cerrarFuera);
  document.addEventListener("keydown",cerrarEsc);
  return()=>{document.removeEventListener("mousedown",cerrarFuera);document.removeEventListener("keydown",cerrarEsc)};
 },[cargoAbierto]);
 useEffect(()=>{setCargoAbierto(false)},[modal]);
 const cargosFiltrados=useMemo(()=>{const q=cargoBusqueda.trim().toLowerCase();return q?cargos.filter(x=>x.cargoDescripcion.toLowerCase().includes(q)):cargos},[cargos,cargoBusqueda]);
 const nuevo=()=>{setSel(null);setDni("");setNombre("");setCargoId(undefined);setCargoBusqueda("");setCargoAbierto(false);setFecha(new Date().toISOString().slice(0,10));setError("");setModal("nuevo")};
 const guardar=async()=>{setGuardando(true);setError("");try{if(modal==="nuevo"){if(!dni.trim())throw new Error("El identificador/DNI es obligatorio.");if(!nombre.trim())throw new Error("Los nombres y apellidos son obligatorios.");if(!cargoId)throw new Error("El cargo inicial es obligatorio.");await crearResponsable({usuarioDni:dni.trim(),usuarioNombresApellidos:nombre.trim(),cargoId,fechaInicioCargo:fecha||null})}else if(modal==="editar"&&sel){if(!nombre.trim())throw new Error("Los nombres y apellidos son obligatorios.");await editarResponsable(sel.usuarioDni,{usuarioNombresApellidos:nombre.trim()})}else if(modal==="cargo"&&sel){if(!cargoId)throw new Error("Selecciona un cargo.");await cambiarCargoResponsable(sel.usuarioDni,{cargoId,fechaInicioCargo:fecha||null})}setModal(null);await cargar()}catch(e){setError(e instanceof Error?e.message:"No se pudo guardar.")}finally{setGuardando(false)}};
 const verHistorial=async(x:ResponsableMaestro)=>{setSel(x);setHistorial(await obtenerHistorialCargosResponsable(x.usuarioDni));setModal("historial")};
 const abrirFirma=async(x:ResponsableMaestro)=>{setSel(x);setFirmaArchivo(null);setFirmaPreview(null);setUsuarioAcceso("");setError("");setFirmaCargando(true);setModal("firma");try{const [r,v]=await Promise.all([obtenerFirmaResponsable(x.usuarioDni),obtenerVinculoResponsableUsuario(x.usuarioDni)]);if(r?.firmaImagen&&r.firmaMimeType)setFirmaPreview(`data:${r.firmaMimeType};base64,${r.firmaImagen}`);setUsuarioAcceso(v?.nombreUsuario??"")}finally{setFirmaCargando(false)}};
 const guardarFirma=async()=>{if(!sel||!firmaArchivo)return setError("Selecciona una imagen de firma.");setGuardando(true);setError("");try{await guardarFirmaResponsable(sel.usuarioDni,firmaArchivo);setModal(null)}catch(e){setError(e instanceof Error?e.message:"No se pudo guardar la firma.")}finally{setGuardando(false)}};
 const generarFirmaAutomatica=async(x:ResponsableMaestro)=>{
  if(generandoFirmaDni)return;
  setError("");
  setMensaje("");
  setGenerandoFirmaDni(x.usuarioDni);
  try{
   const actual=await obtenerFirmaResponsable(x.usuarioDni);
   if(actual?.firmaImagen){
    const ok=confirm(`“${x.usuarioNombresApellidos}” ya tiene una firma registrada. ¿Deseas reemplazarla por una firma generada automáticamente?`);
    if(!ok)return;
   }else{
    const ok=confirm(`¿Generar y guardar automáticamente una firma para “${x.usuarioNombresApellidos}”?`);
    if(!ok)return;
   }
   const archivo=await generarFirmaPng(x.usuarioNombresApellidos,x.usuarioDni);
   await guardarFirmaResponsable(x.usuarioDni,archivo);
   setMensaje(`Firma de “${x.usuarioNombresApellidos}” generada y guardada correctamente.`);
   window.setTimeout(()=>setMensaje(""),3500);
  }catch(e){
   setError(e instanceof Error?e.message:"No se pudo generar la firma.");
  }finally{
   setGenerandoFirmaDni(null);
  }
 };
 const guardarVinculo=async()=>{if(!sel||!usuarioAcceso.trim())return setError("Ingresa el nombre de usuario de acceso.");setVinculando(true);setError("");try{const r=await vincularResponsableUsuario(sel.usuarioDni,usuarioAcceso.trim());setUsuarioAcceso(r.nombreUsuario??usuarioAcceso.trim())}catch(e){setError(e instanceof Error?e.message:"No se pudo vincular el usuario de acceso.")}finally{setVinculando(false)}};
 const abrirHistForm=(h?:HistorialCargoResponsable)=>{setHistEditando(h??null);setCargoId(h?.cargoId);setCargoBusqueda(h?.cargoDescripcion??"");setCargoAbierto(false);setHistFechaInicio(h?.fechaInicio?.slice(0,10)??"");setHistFechaFin(h?.fechaFin?.slice(0,10)??"");setError("");setModal("historial-form")};
 const guardarHistorial=async()=>{if(!sel||!cargoId)return setError("Selecciona un cargo.");setGuardando(true);setError("");try{const req={cargoId,fechaInicio:histFechaInicio||null,fechaFin:histFechaFin||null};if(histEditando)await editarCargoHistoricoResponsable(histEditando.usuarioCargoHistorialId,req);else await agregarCargoHistoricoResponsable(sel.usuarioDni,req);setHistorial(await obtenerHistorialCargosResponsable(sel.usuarioDni));setModal("historial")}catch(e){setError(e instanceof Error?e.message:"No se pudo guardar el historial.")}finally{setGuardando(false)}};
 return <div className="mx-auto w-full max-w-[1500px] space-y-6 px-6 py-6 xl:px-8">
  <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--text-secondary)]">Mantenimientos</p><h1 className="text-2xl font-semibold">Maestro de Responsables</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Administra responsables de documentos, su cargo actual y el historial de cargos.</p></div><Button onClick={nuevo}><CirclePlus/>Nuevo responsable</Button></div>
  {error&&modal===null&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{mensaje&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{mensaje}</div>}
  <Card><CardContent className="p-6"><div className="flex gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><Input className="pl-9" placeholder="Buscar por nombre, identificador o cargo..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div><select className="h-10 rounded-md border bg-white px-3 text-sm" value={filtro} onChange={e=>setFiltro(e.target.value as Filtro)}><option value="todos">Todos</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select></div></CardContent></Card>
  <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[1120px] table-fixed text-sm"><colgroup><col className="w-[24%]"/><col className="w-[14%]"/><col className="w-[26%]"/><col className="w-[8%]"/><col className="w-[8%]"/><col className="w-[20%]"/></colgroup><thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-5 py-3">Responsable</th><th className="px-4 py-3">Identificador</th><th className="px-4 py-3">Cargo actual</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Uso</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody>{cargando?<tr><td colSpan={6} className="p-10 text-center">Cargando...</td></tr>:items.map(x=><tr key={x.usuarioDni} className="border-t"><td className="px-5 py-3 font-medium">{x.usuarioNombresApellidos}</td><td className="px-4 py-3">{x.usuarioDni}</td><td className="px-4 py-3">{x.cargoDescripcion??<span className="text-amber-700">Sin cargo actual</span>}</td><td className="px-4 py-3">{x.estado?"Activo":"Inactivo"}</td><td className="px-4 py-3">{x.tieneUso?"En uso":"Sin uso"}</td><td className="px-5 py-3 text-right"><div className="flex justify-end gap-2"><Button size="icon-sm" variant="outline" title="Editar" onClick={()=>{setSel(x);setNombre(x.usuarioNombresApellidos);setError("");setModal("editar")}}><Pencil/></Button><Button size="icon-sm" variant="outline" title="Cambiar cargo" onClick={()=>{setSel(x);setCargoId(x.cargoId??undefined);setCargoBusqueda(x.cargoDescripcion??"");setCargoAbierto(false);setFecha(new Date().toISOString().slice(0,10));setError("");setModal("cargo")}}><BriefcaseBusiness/></Button><Button size="icon-sm" variant="outline" title="Historial de cargos" onClick={()=>verHistorial(x)}><History/></Button><Button size="icon-sm" variant="outline" title="Firma digital" onClick={()=>abrirFirma(x)}><FileImage/></Button>{!x.tieneUso&&<Button size="icon-sm" variant="outline" title="Eliminar responsable" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={async()=>{if(confirm(`¿Eliminar definitivamente a “${x.usuarioNombresApellidos}”? Esta acción solo está permitida porque no tiene uso histórico.`)){try{await eliminarResponsable(x.usuarioDni);await cargar()}catch(e){setError(e instanceof Error?e.message:"No se pudo eliminar.")}}}}><Trash2/></Button>}<Button size="icon-sm" variant="outline" title={x.estado?"Inactivar":"Activar"} onClick={async()=>{if(confirm(`¿Deseas ${x.estado?"inactivar":"activar"} a “${x.usuarioNombresApellidos}”?`)){await cambiarEstadoResponsable(x.usuarioDni,!x.estado);await cargar()}}}><Power/></Button></div></td></tr>)}</tbody></table></div></CardContent></Card>
  {modal&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"><div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">{modal==="nuevo"?"Nuevo responsable":modal==="editar"?"Editar responsable":modal==="cargo"?"Cambiar cargo":modal==="firma"?"Firma digital":modal==="historial-form"?(histEditando?"Editar cargo histórico":"Agregar cargo histórico"):"Historial de cargos"}</h2>{sel&&modal!=="nuevo"&&<p className="text-xs text-[var(--text-secondary)]">{sel.usuarioNombresApellidos}</p>}</div><button onClick={()=>setModal(null)}><X/></button></div>
   {modal==="firma"?<><div className="space-y-4 p-5">
    <p className="text-sm text-[var(--text-secondary)]">La imagen de firma es opcional y solo se mostrará cuando este responsable confirme formalmente la firma de una ET, FT o certificado.</p>
    <div className="rounded-xl border bg-slate-50 p-4">
     <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Usuario de acceso</p>
     <p className="mt-1 text-xs text-slate-500">Vincula al responsable con la cuenta que recibirá solicitudes de firma.</p>
     <div className="mt-3 flex gap-2">
      <Input value={usuarioAcceso} placeholder="Ej. jcastro o jefe.calidad" onChange={e=>setUsuarioAcceso(e.target.value)}/>
      <Button type="button" variant="outline" disabled={!usuarioAcceso.trim()||vinculando} onClick={guardarVinculo}>{vinculando?"Vinculando...":"Vincular"}</Button>
     </div>
    </div>
    <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed bg-slate-50 p-4">
     {firmaCargando?<span className="text-sm text-slate-500">Cargando firma...</span>:firmaPreview?<img src={firmaPreview} alt="Firma" className="max-h-28 max-w-full object-contain"/>:<span className="text-sm text-slate-400">Sin firma registrada</span>}
    </div>
    {sel&&<div className="flex justify-end">
     <Button type="button" variant="outline" disabled={generandoFirmaDni===sel.usuarioDni} onClick={()=>void generarFirmaAutomatica(sel)}>
      <FileImage/>{generandoFirmaDni===sel.usuarioDni?"Generando...":firmaPreview?"Regenerar firma automáticamente":"Generar firma automáticamente"}
     </Button>
    </div>}
    <label className="block text-sm font-medium">Imagen de firma
     <Input type="file" accept="image/png,image/jpeg,image/webp" className="mt-1" onChange={e=>{const file=e.target.files?.[0]??null;setFirmaArchivo(file);if(file){const r=new FileReader();r.onload=()=>setFirmaPreview(String(r.result));r.readAsDataURL(file)}}}/>
    </label>
    <p className="text-xs text-slate-500">PNG, JPG/JPEG o WEBP. Máximo 2 MB.</p>
    {error&&<p className="text-sm text-red-700">{error}</p>}
   </div><div className="flex justify-between gap-2 border-t p-5">
    <div>{firmaPreview&&<Button variant="outline" className="text-red-600" onClick={async()=>{if(sel&&confirm("¿Quitar la firma registrada?")){await eliminarFirmaResponsable(sel.usuarioDni);setFirmaPreview(null);setFirmaArchivo(null)}}}><Trash2/>Quitar firma</Button>}</div>
    <div className="flex gap-2"><Button variant="outline" onClick={()=>setModal(null)}>Cancelar</Button><Button disabled={!firmaArchivo||guardando} onClick={guardarFirma}><Upload/>{guardando?"Guardando...":"Guardar firma"}</Button></div>
   </div></>:modal==="historial"?<div className="p-5"><div className="mb-4 flex justify-end"><Button onClick={()=>abrirHistForm()}><CirclePlus/>Agregar cargo histórico</Button></div><div className="max-h-[55vh] overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">Cargo</th><th>Inicio</th><th>Fin</th><th>Condición</th><th className="text-right">Acciones</th></tr></thead><tbody>{historial.map(h=><tr key={h.usuarioCargoHistorialId} className="border-t"><td className="py-3">{h.cargoDescripcion}</td><td>{h.fechaInicio?.slice(0,10)??"—"}</td><td>{h.fechaFin?.slice(0,10)??"—"}</td><td>{h.cargoActual?"Actual":"Histórico"}</td><td className="text-right">{!h.cargoActual&&<Button size="icon-sm" variant="outline" title="Editar histórico" onClick={()=>abrirHistForm(h)}><Pencil/></Button>}</td></tr>)}</tbody></table></div></div>:modal==="historial-form"?<><div className="space-y-4 p-5"><label className="block text-sm font-medium">Cargo<div ref={cargoComboRef} className="relative mt-1"><Input value={cargoBusqueda} placeholder="Escribe para buscar un cargo..." autoComplete="off" onFocus={()=>setCargoAbierto(true)} onChange={e=>{setCargoBusqueda(e.target.value);setCargoId(undefined);setCargoAbierto(true)}}/>{cargoAbierto&&<div className="absolute z-[60] mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white py-1 shadow-xl">{cargosFiltrados.length?cargosFiltrados.map(c=><button type="button" key={c.cargoId} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onMouseDown={e=>e.preventDefault()} onClick={()=>{setCargoId(c.cargoId);setCargoBusqueda(c.cargoDescripcion);setCargoAbierto(false)}}>{c.cargoDescripcion}</button>):<div className="px-3 py-3 text-sm text-[var(--text-secondary)]">No se encontraron cargos.</div>}</div>}</div></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Fecha de inicio <span className="font-normal text-slate-400">(opcional)</span><Input type="date" className="mt-1" value={histFechaInicio} onChange={e=>setHistFechaInicio(e.target.value)}/></label><label className="block text-sm font-medium">Fecha fin <span className="font-normal text-slate-400">(opcional)</span><Input type="date" className="mt-1" value={histFechaFin} onChange={e=>setHistFechaFin(e.target.value)}/></label></div>{error&&<p className="text-sm text-red-700">{error}</p>}</div><div className="flex justify-end gap-2 border-t p-5"><Button variant="outline" onClick={()=>setModal("historial")}>Cancelar</Button><Button disabled={guardando} onClick={guardarHistorial}>{guardando?"Guardando...":"Guardar"}</Button></div></>:<><div className="space-y-4 p-5">{modal==="nuevo"&&<label className="block text-sm font-medium">Identificador / DNI<Input className="mt-1" maxLength={20} value={dni} onChange={e=>setDni(e.target.value)}/></label>}{(modal==="nuevo"||modal==="editar")&&<label className="block text-sm font-medium">Nombres y apellidos<Input className="mt-1" maxLength={200} value={nombre} onChange={e=>setNombre(e.target.value)}/></label>}{(modal==="nuevo"||modal==="cargo")&&<><label className="block text-sm font-medium">Cargo<div ref={cargoComboRef} className="relative mt-1"><Input value={cargoBusqueda} placeholder="Escribe para buscar un cargo..." autoComplete="off" onFocus={()=>setCargoAbierto(true)} onChange={e=>{setCargoBusqueda(e.target.value);setCargoId(undefined);setCargoAbierto(true)}}/>{cargoAbierto&&<div className="absolute z-[60] mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white py-1 shadow-xl">{cargosFiltrados.length?cargosFiltrados.map(c=><button type="button" key={c.cargoId} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onMouseDown={e=>e.preventDefault()} onClick={()=>{setCargoId(c.cargoId);setCargoBusqueda(c.cargoDescripcion);setCargoAbierto(false)}}>{c.cargoDescripcion}</button>):<div className="px-3 py-3 text-sm text-[var(--text-secondary)]">No se encontraron cargos.</div>}</div>}</div></label><label className="block text-sm font-medium">Fecha de inicio<Input type="date" className="mt-1" value={fecha} onChange={e=>setFecha(e.target.value)}/></label></>}{error&&<p className="text-sm text-red-700">{error}</p>}</div><div className="flex justify-end gap-2 border-t p-5"><Button variant="outline" onClick={()=>setModal(null)}>Cancelar</Button><Button disabled={guardando} onClick={guardar}>{guardando?"Guardando...":"Guardar"}</Button></div></>}
  </div></div>}
 </div>
}

async function generarFirmaPng(nombreCompleto:string,usuarioDni:string):Promise<File>{
 const nombre=nombreCompleto.trim().replace(/\s+/g," ");
 if(!nombre)throw new Error("El responsable no tiene un nombre válido.");

 const canvas=document.createElement("canvas");
 const ancho=1400;
 const alto=420;
 canvas.width=ancho;
 canvas.height=alto;

 const ctx=canvas.getContext("2d");
 if(!ctx)throw new Error("No se pudo preparar la firma.");

 ctx.clearRect(0,0,ancho,alto);
 ctx.textBaseline="middle";
 ctx.textAlign="center";
 ctx.fillStyle="#082b63";

 const familias=[
  '"Brush Script MT"',
  '"Segoe Script"',
  '"Lucida Handwriting"',
  '"Apple Chancery"',
  'cursive'
 ];

 let tamano=156;
 let fuente=`${tamano}px ${familias.join(",")}`;
 ctx.font=fuente;

 const maxWidth=ancho-150;
 while(ctx.measureText(nombre).width>maxWidth&&tamano>72){
  tamano-=4;
  fuente=`${tamano}px ${familias.join(",")}`;
  ctx.font=fuente;
 }

 ctx.save();
 ctx.translate(ancho/2,alto/2);
 ctx.rotate(-0.045);
 ctx.fillText(nombre,0,0);
 ctx.restore();

 // Trazo inferior sutil para que la firma tenga apariencia manuscrita,
 // sin alterar el nombre ni convertirla en una firma real de otra persona.
 const metrics=ctx.measureText(nombre);
 const linea=Math.min(metrics.width*0.88,maxWidth*0.9);
 ctx.strokeStyle="#082b63";
 ctx.lineWidth=4;
 ctx.lineCap="round";
 ctx.beginPath();
 ctx.moveTo((ancho-linea)/2,alto*0.72);
 ctx.bezierCurveTo(
  ancho*0.42,alto*0.77,
  ancho*0.66,alto*0.64,
  (ancho+linea)/2,alto*0.70
 );
 ctx.stroke();

 const blob=await new Promise<Blob>((resolve,reject)=>{
  canvas.toBlob(b=>b?resolve(b):reject(new Error("No se pudo convertir la firma a PNG.")),"image/png");
 });

 const seguro=nombre.toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[^a-z0-9]+/g,"-")
  .replace(/^-+|-+$/g,"");

 return new File(
  [blob],
  `firma-${seguro||usuarioDni.toLowerCase()}-generada.png`,
  {type:"image/png"}
 );
}
