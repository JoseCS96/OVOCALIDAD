import {useCallback,useEffect,useMemo,useState} from "react";
import {CirclePlus,Power,Search,ShieldCheck,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {listarResponsables,vincularResponsableUsuario,type ResponsableMaestro} from "@/modules/mantenimientos/api";
import {cambiarEstadoUsuarioAcceso,crearUsuarioAcceso,listarPerfilesAcceso,listarUsuariosAcceso,type PerfilAccesoMantenimiento,type UsuarioAccesoMantenimiento} from "./api";

type Filtro="todos"|"activos"|"inactivos";

export default function UsuariosAccesoPage(){
  const [items,setItems]=useState<UsuarioAccesoMantenimiento[]>([]);
  const [perfiles,setPerfiles]=useState<PerfilAccesoMantenimiento[]>([]);
  const [responsables,setResponsables]=useState<ResponsableMaestro[]>([]);
  const [busqueda,setBusqueda]=useState("");
  const [filtro,setFiltro]=useState<Filtro>("todos");
  const [cargando,setCargando]=useState(true);
  const [modal,setModal]=useState(false);
  const [nombreUsuario,setNombreUsuario]=useState("");
  const [nombresApellidos,setNombresApellidos]=useState("");
  const [correo,setCorreo]=useState("");
  const [password,setPassword]=useState("");
  const [perfilId,setPerfilId]=useState<number>(5);
  const [usuarioDni,setUsuarioDni]=useState("");
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState("");
  const [mensaje,setMensaje]=useState("");

  const cargar=useCallback(async()=>{
    setCargando(true);
    try{
      const data=await listarUsuariosAcceso({
        busqueda:busqueda.trim()||undefined,
        estado:filtro==="todos"?undefined:filtro==="activos"
      });
      setItems(data);
    }catch(e){
      setError(e instanceof Error?e.message:"No se pudieron cargar los usuarios.");
    }finally{
      setCargando(false);
    }
  },[busqueda,filtro]);

  useEffect(()=>{const t=setTimeout(cargar,250);return()=>clearTimeout(t)},[cargar]);

  useEffect(()=>{
    Promise.all([
      listarPerfilesAcceso(),
      listarResponsables({estado:true})
    ]).then(([p,r])=>{
      setPerfiles(p);
      setResponsables(r);
      const analista=p.find(x=>x.perfilCodigo==="ANALISTA_CALIDAD");
      if(analista)setPerfilId(analista.perfilId);
    }).catch(()=>{});
  },[]);

  const responsablesDisponibles=useMemo(
    ()=>responsables.filter(r=>!items.some(u=>u.usuarioDniResponsable===r.usuarioDni)),
    [responsables,items]
  );

  const abrirNuevo=()=>{
    setNombreUsuario("");
    setNombresApellidos("");
    setCorreo("");
    setPassword("");
    const analista=perfiles.find(x=>x.perfilCodigo==="ANALISTA_CALIDAD");
    setPerfilId(analista?.perfilId??perfiles[0]?.perfilId??5);
    setUsuarioDni("");
    setError("");
    setModal(true);
  };

  const seleccionarResponsable=(dni:string)=>{
    setUsuarioDni(dni);
    const r=responsables.find(x=>x.usuarioDni===dni);
    if(!r)return;
    setNombresApellidos(r.usuarioNombresApellidos);
    if(!nombreUsuario.trim()){
      const partes=r.usuarioNombresApellidos
        .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()
        .split(/\s+/).filter(Boolean);
      if(partes.length>=2)setNombreUsuario(`${partes[0]}.${partes[partes.length-1]}`);
    }
  };

  const guardar=async()=>{
    if(!nombreUsuario.trim())return setError("El nombre de usuario es obligatorio.");
    if(!nombresApellidos.trim())return setError("Los nombres y apellidos son obligatorios.");
    if(password.length<8)return setError("La contraseña debe tener al menos 8 caracteres.");
    if(!perfilId)return setError("Selecciona un perfil.");
    if(!usuarioDni)return setError("Selecciona el responsable documental que usará esta cuenta.");

    setGuardando(true);
    setError("");
    setMensaje("");
    try{
      await crearUsuarioAcceso({
        nombreUsuario:nombreUsuario.trim(),
        nombresApellidos:nombresApellidos.trim(),
        correo:correo.trim()||null,
        password,
        perfilId
      });

      await vincularResponsableUsuario(usuarioDni,nombreUsuario.trim());

      setModal(false);
      setMensaje(`Usuario “${nombreUsuario.trim()}” creado y vinculado correctamente.`);
      await cargar();
      window.setTimeout(()=>setMensaje(""),3500);
    }catch(e){
      setError(e instanceof Error?e.message:"No se pudo crear el usuario.");
    }finally{
      setGuardando(false);
    }
  };

  return <div className="mx-auto w-full max-w-[1500px] space-y-6 px-6 py-6 xl:px-8">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--text-secondary)]">Sistema · Administración</p>
        <h1 className="text-2xl font-semibold">Usuarios de acceso</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Administra las cuentas que ingresan a OVOCALIDAD y su vínculo con responsables documentales.</p>
      </div>
      <Button onClick={abrirNuevo}><CirclePlus/>Nuevo usuario</Button>
    </div>

    {mensaje&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{mensaje}</div>}
    {error&&!modal&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

    <Card><CardContent className="p-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
          <Input className="pl-9" placeholder="Buscar por usuario, nombre, correo o responsable..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
        </div>
        <select className="h-10 rounded-md border bg-white px-3 text-sm" value={filtro} onChange={e=>setFiltro(e.target.value as Filtro)}>
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>
    </CardContent></Card>

    <Card><CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] table-fixed text-sm">
          <colgroup>
            <col className="w-[18%]"/><col className="w-[23%]"/><col className="w-[18%]"/><col className="w-[22%]"/><col className="w-[9%]"/><col className="w-[10%]"/>
          </colgroup>
          <thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-secondary)]">
            <tr>
              <th className="px-5 py-3">Usuario</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Responsable vinculado</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando?<tr><td colSpan={6} className="p-10 text-center">Cargando...</td></tr>:
            items.length===0?<tr><td colSpan={6} className="p-10 text-center text-slate-500">No se encontraron usuarios.</td></tr>:
            items.map(x=><tr key={x.segUsuarioId} className="border-t">
              <td className="px-5 py-3 font-medium">{x.nombreUsuario}</td>
              <td className="px-4 py-3">{x.nombresApellidos}</td>
              <td className="px-4 py-3">{x.perfilDescripcion??x.perfilCodigo??"Sin perfil"}</td>
              <td className="px-4 py-3">{x.responsableNombre?<div><div className="font-medium">{x.responsableNombre}</div><div className="text-xs text-slate-500">{x.usuarioDniResponsable}</div></div>:<span className="text-amber-700">Sin vínculo</span>}</td>
              <td className="px-4 py-3"><span className={x.estado?"text-emerald-700":"text-slate-500"}>{x.estado?"Activo":"Inactivo"}</span></td>
              <td className="px-5 py-3 text-right">
                <Button size="icon-sm" variant="outline" title={x.estado?"Inactivar usuario":"Activar usuario"} onClick={async()=>{
                  if(!confirm(`¿Deseas ${x.estado?"inactivar":"activar"} a “${x.nombreUsuario}”?`))return;
                  try{
                    await cambiarEstadoUsuarioAcceso(x.segUsuarioId,!x.estado);
                    await cargar();
                  }catch(e){setError(e instanceof Error?e.message:"No se pudo cambiar el estado.");}
                }}><Power/></Button>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </CardContent></Card>

    {modal&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">Nuevo usuario de acceso</h2>
            <p className="text-xs text-[var(--text-secondary)]">La cuenta quedará vinculada al responsable seleccionado.</p>
          </div>
          <button onClick={()=>setModal(false)}><X/></button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block text-sm font-medium">Responsable documental
            <select className="mt-1 h-10 w-full rounded-md border bg-white px-3 text-sm" value={usuarioDni} onChange={e=>seleccionarResponsable(e.target.value)}>
              <option value="">Seleccionar responsable...</option>
              {responsablesDisponibles.map(r=><option key={r.usuarioDni} value={r.usuarioDni}>{r.usuarioNombresApellidos} · {r.usuarioDni}</option>)}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Usuario
              <Input className="mt-1" value={nombreUsuario} placeholder="Ej. victor.castillo" onChange={e=>setNombreUsuario(e.target.value)}/>
            </label>
            <label className="block text-sm font-medium">Perfil
              <select className="mt-1 h-10 w-full rounded-md border bg-white px-3 text-sm" value={perfilId} onChange={e=>setPerfilId(Number(e.target.value))}>
                {perfiles.map(p=><option key={p.perfilId} value={p.perfilId}>{p.perfilDescripcion}</option>)}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium">Nombres y apellidos
            <Input className="mt-1" value={nombresApellidos} onChange={e=>setNombresApellidos(e.target.value)}/>
          </label>

          <label className="block text-sm font-medium">Correo <span className="font-normal text-slate-400">(opcional)</span>
            <Input className="mt-1" type="email" value={correo} onChange={e=>setCorreo(e.target.value)}/>
          </label>

          <label className="block text-sm font-medium">Contraseña inicial
            <Input className="mt-1" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/>
          </label>
          <p className="text-xs text-slate-500">Mínimo 8 caracteres. La contraseña se almacena como hash; no se guarda en texto plano.</p>

          {error&&<p className="text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t p-5">
          <Button variant="outline" onClick={()=>setModal(false)}>Cancelar</Button>
          <Button disabled={guardando} onClick={guardar}><ShieldCheck/>{guardando?"Creando...":"Crear y vincular"}</Button>
        </div>
      </div>
    </div>}
  </div>
}
