import {useEffect,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {Building2,FilePlus2,LayoutTemplate,Pencil,Save,Search,Star,Trash2,X} from "lucide-react";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {useAuth} from "@/modules/auth/AuthContext";
import {
 crearPlantilla,
 eliminarPlantilla,
 guardarEmpresaCertificado,
 listarFichasTecnicasCertificado,
 listarPlantillas,
 obtenerEmpresaCertificado,
} from "./api";
import type {GuardarCertificadoEmpresa} from "./types";

const empresaVacia:GuardarCertificadoEmpresa={
 razonSocial:"",
 nombreComercial:"",
 direccion:"",
 telefono:"",
 fax:"",
 correo:"",
 sitioWeb:"",
 ruc:"",
};

export default function CertificadosPage(){
 const nav=useNavigate(),qc=useQueryClient();
 const {tienePerfil}=useAuth();
 const puedeEditarEmpresa=tienePerfil("JEFE_CALIDAD");

 const q=useQuery({queryKey:["certificado-plantillas"],queryFn:()=>listarPlantillas()});
 const empresa=useQuery({queryKey:["certificado-empresa"],queryFn:obtenerEmpresaCertificado});
 const [editandoEmpresa,setEditandoEmpresa]=useState(false);
 const [formEmpresa,setFormEmpresa]=useState<GuardarCertificadoEmpresa>(empresaVacia);

 useEffect(()=>{
  if(!empresa.data)return;
  setFormEmpresa({
   razonSocial:empresa.data.razonSocial??"",
   nombreComercial:empresa.data.nombreComercial??"",
   direccion:empresa.data.direccion??"",
   telefono:empresa.data.telefono??"",
   fax:empresa.data.fax??"",
   correo:empresa.data.correo??"",
   sitioWeb:empresa.data.sitioWeb??"",
   ruc:empresa.data.ruc??"",
  });
 },[empresa.data]);

 const guardarEmpresa=useMutation({
  mutationFn:()=>guardarEmpresaCertificado(formEmpresa),
  onSuccess:async()=>{
   await qc.invalidateQueries({queryKey:["certificado-empresa"]});
   setEditandoEmpresa(false);
  },
 });

 const [busquedaFt,setBusquedaFt]=useState("");
 const [versionFtId,setVersionFtId]=useState<number|null>(null);
 const [nombre,setNombre]=useState("");
 const ft=useQuery({
  queryKey:["fichas-tecnicas-certificado",busquedaFt],
  queryFn:()=>listarFichasTecnicasCertificado(busquedaFt),
 });
 const seleccionada=ft.data?.find(x=>x.versionId===versionFtId)??null;

 const crear=useMutation({
  mutationFn:()=>crearPlantilla({versionFtId:versionFtId!,nombre:nombre.trim(),descripcion:null}),
  onSuccess:r=>{
   qc.invalidateQueries({queryKey:["certificado-plantillas"]});
   nav(`/certificacion/certificados/plantillas/${r.certificadoPlantillaId}`);
  },
 });
 const eliminar=useMutation({
  mutationFn:eliminarPlantilla,
  onSuccess:()=>qc.invalidateQueries({queryKey:["certificado-plantillas"]}),
 });

 const actualizarEmpresa=(campo:keyof GuardarCertificadoEmpresa,valor:string)=>
  setFormEmpresa(actual=>({...actual,[campo]:valor}));

 return <PageContainer className="space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div>
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--primary)]">Gestión documental · Certificados</p>
    <h1 className="mt-1 text-2xl font-semibold">Diseño de certificados</h1>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">La Ficha Técnica define los parámetros certificables; la plantilla define cómo se presentan.</p>
   </div>
   <Button variant="outline" className="bg-white" onClick={()=>nav("/documentos/diseno-certificados/asignacion")}>
    <Star className="size-4"/>Asignación predeterminada
   </Button>
  </div>

  <Card>
   <CardContent className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100"><Building2 className="size-5 text-slate-600"/></div>
      <div>
       <h2 className="font-semibold">Datos para certificado - Empresa</h2>
       <p className="text-sm text-[var(--text-secondary)]">Estos datos son dinámicos y se utilizarán en la cabecera institucional de los certificados.</p>
      </div>
     </div>
     {puedeEditarEmpresa&&!editandoEmpresa&&<Button variant="outline" size="sm" onClick={()=>setEditandoEmpresa(true)}><Pencil/>Editar</Button>}
     {puedeEditarEmpresa&&editandoEmpresa&&<div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={()=>{
       if(empresa.data)setFormEmpresa({
        razonSocial:empresa.data.razonSocial??"",
        nombreComercial:empresa.data.nombreComercial??"",
        direccion:empresa.data.direccion??"",
        telefono:empresa.data.telefono??"",
        fax:empresa.data.fax??"",
        correo:empresa.data.correo??"",
        sitioWeb:empresa.data.sitioWeb??"",
        ruc:empresa.data.ruc??"",
       });
       setEditandoEmpresa(false);
      }}><X/>Cancelar</Button>
      <Button size="sm" disabled={!formEmpresa.razonSocial.trim()||guardarEmpresa.isPending} onClick={()=>guardarEmpresa.mutate()}><Save/>{guardarEmpresa.isPending?"Guardando...":"Guardar"}</Button>
     </div>}
    </div>

    {empresa.isLoading?<div className="mt-4 text-sm">Cargando datos de empresa...</div>:
    empresa.isError?<div className="mt-4 text-sm text-red-600">No se pudieron cargar los datos de empresa.</div>:
    editandoEmpresa?<div className="mt-5 grid gap-4 md:grid-cols-2">
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Razón social *</span><Input value={formEmpresa.razonSocial} onChange={e=>actualizarEmpresa("razonSocial",e.target.value)}/></label>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Nombre comercial</span><Input value={formEmpresa.nombreComercial??""} onChange={e=>actualizarEmpresa("nombreComercial",e.target.value)}/></label>
     <label className="block md:col-span-2"><span className="mb-1 block text-xs font-semibold text-slate-600">Dirección</span><Input value={formEmpresa.direccion??""} onChange={e=>actualizarEmpresa("direccion",e.target.value)}/></label>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Teléfono</span><Input value={formEmpresa.telefono??""} onChange={e=>actualizarEmpresa("telefono",e.target.value)}/></label>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Fax</span><Input value={formEmpresa.fax??""} onChange={e=>actualizarEmpresa("fax",e.target.value)}/></label>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Correo</span><Input value={formEmpresa.correo??""} onChange={e=>actualizarEmpresa("correo",e.target.value)}/></label>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Sitio web</span><Input value={formEmpresa.sitioWeb??""} onChange={e=>actualizarEmpresa("sitioWeb",e.target.value)}/></label>
     <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">RUC</span><Input value={formEmpresa.ruc??""} onChange={e=>actualizarEmpresa("ruc",e.target.value)}/></label>
    </div>:
    empresa.data?<div className="mt-5 rounded-lg border bg-slate-50 p-4">
     <div className="font-semibold">{empresa.data.razonSocial}</div>
     {empresa.data.nombreComercial&&empresa.data.nombreComercial!==empresa.data.razonSocial&&<div className="mt-1 text-sm text-slate-600">{empresa.data.nombreComercial}</div>}
     <div className="mt-3 grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
      <div><span className="font-semibold">D:</span> {empresa.data.direccion||"—"}</div>
      <div><span className="font-semibold">RUC:</span> {empresa.data.ruc||"—"}</div>
      <div><span className="font-semibold">T:</span> {empresa.data.telefono||"—"}</div>
      <div><span className="font-semibold">F:</span> {empresa.data.fax||"—"}</div>
      <div><span className="font-semibold">E:</span> {empresa.data.correo||"—"}</div>
      <div><span className="font-semibold">W:</span> {empresa.data.sitioWeb||"—"}</div>
     </div>
     {!puedeEditarEmpresa&&<p className="mt-3 border-t pt-3 text-xs text-[var(--text-secondary)]">Solo Jefe de Calidad puede modificar los datos institucionales del certificado.</p>}
    </div>:null}

    {guardarEmpresa.isError&&<p className="mt-3 text-sm text-red-600">{guardarEmpresa.error instanceof Error?guardarEmpresa.error.message:"No se pudieron guardar los datos de empresa."}</p>}
    {guardarEmpresa.isSuccess&&<p className="mt-3 text-sm text-emerald-700">Datos de empresa actualizados correctamente.</p>}
   </CardContent>
  </Card>

  <Card><CardContent className="space-y-4 p-5">
   <div><h2 className="font-semibold">Nueva plantilla</h2><p className="text-sm text-[var(--text-secondary)]">Selecciona una Ficha Técnica vigente con parámetros habilitados para certificado.</p></div>
   <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]"/><Input className="pl-9" placeholder="Buscar por producto, código o descripción de FT" value={busquedaFt} onChange={e=>{setBusquedaFt(e.target.value);setVersionFtId(null)}}/></div>
   <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.8fr)_auto]">
    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={versionFtId??""} onChange={e=>setVersionFtId(e.target.value?Number(e.target.value):null)} disabled={ft.isLoading}>
     <option value="">{ft.isLoading?"Cargando fichas técnicas...":"Seleccionar Ficha Técnica"}</option>
     {ft.data?.map(x=><option key={x.versionId} value={x.versionId}>{x.productoCodigo??"Sin producto"} — {x.documentoCodigo} · v{x.versionNumero} · {x.cantidadParametrosCertificables} parámetros</option>)}
    </select>
    <Input placeholder="Nombre de plantilla, ej. Certificado Fisicoquímico" value={nombre} onChange={e=>setNombre(e.target.value)}/>
    <Button disabled={!versionFtId||!nombre.trim()||crear.isPending} onClick={()=>crear.mutate()}><FilePlus2/>{crear.isPending?"Creando...":"Crear plantilla"}</Button>
   </div>
   {seleccionada&&<div className="rounded-lg border bg-slate-50 p-4 text-sm"><div className="font-semibold">{seleccionada.productoCodigo??"—"} — {seleccionada.documentoDescripcionDocumento}</div><div className="mt-1 text-[var(--text-secondary)]">{seleccionada.documentoCodigo} · Versión {seleccionada.versionNumero} · {seleccionada.estadoVersion}</div><div className="mt-2 font-medium">{seleccionada.cantidadParametrosCertificables} parámetros certificables disponibles según FT</div></div>}
   {ft.isError&&<p className="text-sm text-red-600">No se pudieron cargar las Fichas Técnicas disponibles.</p>}
   {crear.isError&&<p className="text-sm text-red-600">{crear.error instanceof Error?crear.error.message:"No se pudo crear."}</p>}
  </CardContent></Card>

  <Card><CardContent className="p-0">{q.isLoading?<div className="p-6 text-sm">Cargando plantillas...</div>:!q.data?.length?<div className="p-10 text-center"><LayoutTemplate className="mx-auto mb-3 opacity-40"/><p className="font-medium">Aún no hay plantillas de certificado</p><p className="text-sm text-[var(--text-secondary)]">Crea la primera a partir de una versión de Ficha Técnica.</p></div>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-slate-50 text-left"><tr><th className="p-3">Plantilla</th><th className="p-3">Producto / FT</th><th className="p-3">Diseño</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>{q.data.map(x=><tr key={x.certificadoPlantillaId} className="border-b last:border-0"><td className="p-3"><div className="flex flex-wrap items-center gap-2"><b>{x.nombre}</b>{x.esPredeterminada&&<Badge className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]"><Star className="mr-1 size-3 fill-[var(--secondary)] text-[var(--secondary)]"/>Predeterminada</Badge>}</div><div className="text-xs text-[var(--text-secondary)]">{x.descripcion}</div></td><td className="p-3"><b>{x.productoCodigo??"—"}</b><div className="text-xs">{x.documentoCodigo} · v{x.versionNumero}</div></td><td className="p-3">{x.cantidadSecciones} secciones · {x.cantidadCaracteristicas} parámetros</td><td className="p-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={()=>nav(`/certificacion/certificados/plantillas/${x.certificadoPlantillaId}`)}><Pencil/>Diseñar</Button><Button size="sm" variant="outline" onClick={()=>{if(confirm("¿Desactivar esta plantilla?"))eliminar.mutate(x.certificadoPlantillaId)}}><Trash2/></Button></div></td></tr>)}</tbody></table></div>}</CardContent></Card>
 </PageContainer>
}
