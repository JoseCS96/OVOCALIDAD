import {useEffect,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {Building2,Pencil,Save,X} from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {guardarEmpresaCertificado,obtenerEmpresaCertificado} from "@/modules/certificados/api";
import type {GuardarCertificadoEmpresa} from "@/modules/certificados/types";

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

export default function MaestroCertificadoPage(){
 const qc=useQueryClient();
 const empresa=useQuery({queryKey:["certificado-empresa"],queryFn:obtenerEmpresaCertificado});
 const [editando,setEditando]=useState(false);
 const [form,setForm]=useState<GuardarCertificadoEmpresa>(empresaVacia);

 useEffect(()=>{
  if(!empresa.data)return;
  setForm({
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

 const guardar=useMutation({
  mutationFn:()=>guardarEmpresaCertificado(form),
  onSuccess:async()=>{
   await qc.invalidateQueries({queryKey:["certificado-empresa"]});
   setEditando(false);
  }
 });

 const actualizar=(campo:keyof GuardarCertificadoEmpresa,valor:string)=>
  setForm(actual=>({...actual,[campo]:valor}));

 const cancelar=()=>{
  if(empresa.data)setForm({
   razonSocial:empresa.data.razonSocial??"",
   nombreComercial:empresa.data.nombreComercial??"",
   direccion:empresa.data.direccion??"",
   telefono:empresa.data.telefono??"",
   fax:empresa.data.fax??"",
   correo:empresa.data.correo??"",
   sitioWeb:empresa.data.sitioWeb??"",
   ruc:empresa.data.ruc??"",
  });
  setEditando(false);
 };

 return <PageContainer className="space-y-5">
  <div>
   <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--primary)]">Mantenimientos · Certificación</p>
   <h1 className="mt-1 text-2xl font-semibold">Maestro de certificado</h1>
   <p className="mt-1 text-sm text-[var(--text-secondary)]">
    Configuración institucional utilizada en la generación de certificados. Aquí se incorporarán también logos, firmantes y parámetros generales.
   </p>
  </div>

  <Card className="overflow-hidden">
   <div className="h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary))]"/>
   <CardContent className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
       <Building2 className="size-5"/>
      </div>
      <div>
       <h2 className="font-semibold">Datos de empresa</h2>
       <p className="text-sm text-[var(--text-secondary)]">
        Información institucional que se imprime dinámicamente en los certificados.
       </p>
      </div>
     </div>

     {!editando?<Button variant="outline" size="sm" className="bg-white" onClick={()=>setEditando(true)}><Pencil/>Editar</Button>:
     <div className="flex gap-2">
      <Button variant="outline" size="sm" className="bg-white" disabled={guardar.isPending} onClick={cancelar}><X/>Cancelar</Button>
      <Button size="sm" disabled={!form.razonSocial.trim()||guardar.isPending} onClick={()=>guardar.mutate()}><Save/>{guardar.isPending?"Guardando...":"Guardar"}</Button>
     </div>}
    </div>

    {empresa.isLoading?<div className="mt-5 text-sm">Cargando datos de empresa...</div>:
    empresa.isError?<div className="mt-5 text-sm text-red-600">No se pudieron cargar los datos de empresa.</div>:
    editando?<div className="mt-5 grid gap-4 md:grid-cols-2">
     <Campo label="Razón social *"><Input value={form.razonSocial} onChange={e=>actualizar("razonSocial",e.target.value)}/></Campo>
     <Campo label="Nombre comercial"><Input value={form.nombreComercial??""} onChange={e=>actualizar("nombreComercial",e.target.value)}/></Campo>
     <div className="md:col-span-2"><Campo label="Dirección"><Input value={form.direccion??""} onChange={e=>actualizar("direccion",e.target.value)}/></Campo></div>
     <Campo label="Teléfono"><Input value={form.telefono??""} onChange={e=>actualizar("telefono",e.target.value)}/></Campo>
     <Campo label="Fax"><Input value={form.fax??""} onChange={e=>actualizar("fax",e.target.value)}/></Campo>
     <Campo label="Correo"><Input value={form.correo??""} onChange={e=>actualizar("correo",e.target.value)}/></Campo>
     <Campo label="Sitio web"><Input value={form.sitioWeb??""} onChange={e=>actualizar("sitioWeb",e.target.value)}/></Campo>
     <Campo label="RUC"><Input value={form.ruc??""} onChange={e=>actualizar("ruc",e.target.value)}/></Campo>
    </div>:
    empresa.data?<div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--primary-soft)]/40 p-5">
     <div className="font-semibold text-[var(--primary-strong)]">{empresa.data.razonSocial}</div>
     {empresa.data.nombreComercial&&empresa.data.nombreComercial!==empresa.data.razonSocial&&<div className="mt-1 text-sm text-slate-600">{empresa.data.nombreComercial}</div>}
     <div className="mt-4 grid gap-x-8 gap-y-3 text-sm md:grid-cols-2">
      <Dato label="Dirección" value={empresa.data.direccion}/>
      <Dato label="RUC" value={empresa.data.ruc}/>
      <Dato label="Teléfono" value={empresa.data.telefono}/>
      <Dato label="Fax" value={empresa.data.fax}/>
      <Dato label="Correo" value={empresa.data.correo}/>
      <Dato label="Sitio web" value={empresa.data.sitioWeb}/>
     </div>
    </div>:null}

    {guardar.isError&&<div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{guardar.error instanceof Error?guardar.error.message:"No se pudieron guardar los datos."}</div>}
    {guardar.isSuccess&&<div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Datos de empresa actualizados correctamente.</div>}
   </CardContent>
  </Card>

  <div className="grid gap-4 md:grid-cols-2">
   <Card><CardContent className="p-5">
    <h2 className="font-semibold">Identidad institucional</h2>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">Próximamente: logo principal, logo alternativo y parámetros visuales OVOSUR.</p>
   </CardContent></Card>
   <Card><CardContent className="p-5">
    <h2 className="font-semibold">Firmantes del certificado</h2>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">Próximamente: responsable, cargo, firma y vigencia para emisión.</p>
   </CardContent></Card>
  </div>
 </PageContainer>;
}

function Campo({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>}
function Dato({label,value}:{label:string;value:string|null}){return <div><span className="font-semibold">{label}:</span> {value||"—"}</div>}
