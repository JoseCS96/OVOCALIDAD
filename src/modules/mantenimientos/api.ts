import { api } from "@/lib/api";

export type IngredienteMantenimiento={
 ingredienteId:number;ingredienteDescripcion:string;unidadDeMedida:string|null;estado:boolean;
 audUsuarioCreacion:string;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;tieneUso:boolean
};
export type OperacionIngrediente={codigoResultado:number;mensaje:string;ingredienteId?:number;estado?:boolean};
function validar(x:OperacionIngrediente){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarIngredientes(params?:{busqueda?:string;estado?:boolean}){const {data}=await api.get<IngredienteMantenimiento[]>("/api/mantenimientos/ingredientes",{params});return data}
export async function crearIngrediente(request:{ingredienteDescripcion:string;unidadDeMedida:string|null}){const {data}=await api.post<OperacionIngrediente>("/api/mantenimientos/ingredientes",request);return validar(data)}
export async function editarIngrediente(id:number,request:{ingredienteDescripcion:string;unidadDeMedida:string|null}){const {data}=await api.put<OperacionIngrediente>(`/api/mantenimientos/ingredientes/${id}`,request);return validar(data)}
export async function cambiarEstadoIngrediente(id:number,estado:boolean){const {data}=await api.patch<OperacionIngrediente>(`/api/mantenimientos/ingredientes/${id}/estado`,{estado});return validar(data)}


export type CaracteristicaMantenimiento={
 caracteristicaId:number;caracteristicaDescripcion:string;caracteristicaUnidadDeMedida:string|null;
 tipoCaractId:number;tipoCaractDescripcion:string;metEnsayoId:number|null;metEnsayoDescripcion:string|null;
 estado:boolean;audUsuarioCreacion:string;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;tieneUso:boolean
};
export type TipoCaracteristicaMantenimiento={tipoCaractId:number;tipoCaractDescripcion:string};
export type MetodoEnsayoMantenimiento={metEnsayoId:number;metEnsayoDescripcion:string};
export type CatalogosCaracteristicaMantenimiento={tiposCaracteristica:TipoCaracteristicaMantenimiento[];metodosEnsayo:MetodoEnsayoMantenimiento[]};
export type OperacionCaracteristica={codigoResultado:number;mensaje:string;caracteristicaId?:number;estado?:boolean};
function validarCaracteristica(x:OperacionCaracteristica){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarCaracteristicas(params?:{busqueda?:string;tipoCaractId?:number;estado?:boolean}){const {data}=await api.get<CaracteristicaMantenimiento[]>("/api/mantenimientos/caracteristicas",{params});return data}
export async function obtenerCatalogosCaracteristica(){const {data}=await api.get<CatalogosCaracteristicaMantenimiento>("/api/mantenimientos/caracteristicas/catalogos");return data}
export async function crearCaracteristica(request:{caracteristicaDescripcion:string;caracteristicaUnidadDeMedida:string|null;tipoCaractId:number;metEnsayoId:number}){const {data}=await api.post<OperacionCaracteristica>("/api/mantenimientos/caracteristicas",request);return validarCaracteristica(data)}
export async function editarCaracteristica(id:number,request:{caracteristicaDescripcion:string;caracteristicaUnidadDeMedida:string|null;tipoCaractId:number;metEnsayoId:number}){const {data}=await api.put<OperacionCaracteristica>(`/api/mantenimientos/caracteristicas/${id}`,request);return validarCaracteristica(data)}
export async function cambiarEstadoCaracteristica(id:number,estado:boolean){const {data}=await api.patch<OperacionCaracteristica>(`/api/mantenimientos/caracteristicas/${id}/estado`,{estado});return validarCaracteristica(data)}


export type TipoCaracteristicaMaestro={
 tipoCaractId:number;tipoCaractDescripcion:string;estado:boolean;
 audUsuarioCreacion:string;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;tieneUso:boolean
};
export type OperacionTipoCaracteristica={codigoResultado:number;mensaje:string;tipoCaractId?:number;estado?:boolean};
function validarTipoCaracteristica(x:OperacionTipoCaracteristica){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarTiposCaracteristica(params?:{busqueda?:string;estado?:boolean}){const {data}=await api.get<TipoCaracteristicaMaestro[]>("/api/mantenimientos/tipos-caracteristica",{params});return data}
export async function crearTipoCaracteristica(request:{tipoCaractDescripcion:string}){const {data}=await api.post<OperacionTipoCaracteristica>("/api/mantenimientos/tipos-caracteristica",request);return validarTipoCaracteristica(data)}
export async function editarTipoCaracteristica(id:number,request:{tipoCaractDescripcion:string}){const {data}=await api.put<OperacionTipoCaracteristica>(`/api/mantenimientos/tipos-caracteristica/${id}`,request);return validarTipoCaracteristica(data)}
export async function cambiarEstadoTipoCaracteristica(id:number,estado:boolean){const {data}=await api.patch<OperacionTipoCaracteristica>(`/api/mantenimientos/tipos-caracteristica/${id}/estado`,{estado});return validarTipoCaracteristica(data)}

export type MetodoEnsayoMaestro={
 metEnsayoId:number;metEnsayoDescripcion:string;estado:boolean;
 audUsuarioCreacion:string;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;tieneUso:boolean
};
export type OperacionMetodoEnsayo={codigoResultado:number;mensaje:string;metEnsayoId?:number;estado?:boolean};
function validarMetodoEnsayo(x:OperacionMetodoEnsayo){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarMetodosEnsayo(params?:{busqueda?:string;estado?:boolean}){const {data}=await api.get<MetodoEnsayoMaestro[]>("/api/mantenimientos/metodos-ensayo",{params});return data}
export async function crearMetodoEnsayo(request:{metEnsayoDescripcion:string}){const {data}=await api.post<OperacionMetodoEnsayo>("/api/mantenimientos/metodos-ensayo",request);return validarMetodoEnsayo(data)}
export async function editarMetodoEnsayo(id:number,request:{metEnsayoDescripcion:string}){const {data}=await api.put<OperacionMetodoEnsayo>(`/api/mantenimientos/metodos-ensayo/${id}`,request);return validarMetodoEnsayo(data)}
export async function cambiarEstadoMetodoEnsayo(id:number,estado:boolean){const {data}=await api.patch<OperacionMetodoEnsayo>(`/api/mantenimientos/metodos-ensayo/${id}/estado`,{estado});return validarMetodoEnsayo(data)}


export type ContenidoRotuladoMaestro={
 contRotuladoId:number;contRotuladoDescripcion:string|null;estado:boolean;
 audUsuarioCreacion:string;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null;tieneUso:boolean
};
export type OperacionContenidoRotulado={codigoResultado:number;mensaje:string;contRotuladoId?:number;estado?:boolean};
function validarContenidoRotulado(x:OperacionContenidoRotulado){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarContenidosRotulado(params?:{busqueda?:string;estado?:boolean}){const {data}=await api.get<ContenidoRotuladoMaestro[]>("/api/mantenimientos/contenidos-rotulado",{params});return data}
export async function crearContenidoRotulado(request:{contRotuladoDescripcion:string}){const {data}=await api.post<OperacionContenidoRotulado>("/api/mantenimientos/contenidos-rotulado",request);return validarContenidoRotulado(data)}
export async function editarContenidoRotulado(id:number,request:{contRotuladoDescripcion:string}){const {data}=await api.put<OperacionContenidoRotulado>(`/api/mantenimientos/contenidos-rotulado/${id}`,request);return validarContenidoRotulado(data)}
export async function cambiarEstadoContenidoRotulado(id:number,estado:boolean){const {data}=await api.patch<OperacionContenidoRotulado>(`/api/mantenimientos/contenidos-rotulado/${id}/estado`,{estado});return validarContenidoRotulado(data)}


export type CargoMaestro={cargoId:number;cargoDescripcion:string;estado:boolean;tieneUso:boolean;cantidadResponsables:number;audUsuarioCreacion:string|null;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null};
export type CargoActivo={cargoId:number;cargoDescripcion:string};
export type OperacionCargo={codigoResultado:number;mensaje:string;cargoId?:number;estado?:boolean};
function validarCargo(x:OperacionCargo){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarCargos(params?:{busqueda?:string;estado?:boolean}){const {data}=await api.get<CargoMaestro[]>("/api/mantenimientos/cargos",{params});return data}
export async function listarCargosActivos(){const {data}=await api.get<CargoActivo[]>("/api/mantenimientos/cargos/activos");return data}
export async function crearCargo(request:{cargoDescripcion:string}){const {data}=await api.post<OperacionCargo>("/api/mantenimientos/cargos",request);return validarCargo(data)}
export async function editarCargo(id:number,request:{cargoDescripcion:string}){const {data}=await api.put<OperacionCargo>(`/api/mantenimientos/cargos/${id}`,request);return validarCargo(data)}
export async function cambiarEstadoCargo(id:number,estado:boolean){const {data}=await api.patch<OperacionCargo>(`/api/mantenimientos/cargos/${id}/estado`,{estado});return validarCargo(data)}

export type ResponsableMaestro={usuarioDni:string;usuarioNombresApellidos:string;estado:boolean;usuarioInicioVigencia:string|null;usuarioFinVigencia:string|null;tipoUsuarioId:number;usuarioCargoHistorialId:number|null;cargoId:number|null;cargoDescripcion:string|null;cargoFechaInicio:string|null;tieneCargoActual:boolean;tieneUso:boolean;audUsuarioCreacion:string|null;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null};
export type HistorialCargoResponsable={usuarioCargoHistorialId:number;usuarioDni:string;usuarioNombresApellidos:string;cargoId:number;cargoDescripcion:string;fechaInicio:string|null;fechaFin:string|null;cargoActual:boolean;estado:boolean;audUsuarioCreacion:string|null;audFechaCreacion:string;audUsuarioModificacion:string|null;audFechaActualizacion:string|null};
export type OperacionResponsable={codigoResultado:number;mensaje:string;usuarioDni?:string;usuarioCargoHistorialId?:number;cargoId?:number;estado?:boolean};
function validarResponsable(x:OperacionResponsable){if(x.codigoResultado!==0)throw new Error(x.mensaje);return x}
export async function listarResponsables(params?:{busqueda?:string;estado?:boolean}){const {data}=await api.get<ResponsableMaestro[]>("/api/mantenimientos/responsables",{params});return data}
export async function crearResponsable(request:{usuarioDni:string;usuarioNombresApellidos:string;cargoId:number;fechaInicioCargo?:string|null}){const {data}=await api.post<OperacionResponsable>("/api/mantenimientos/responsables",request);return validarResponsable(data)}
export async function editarResponsable(usuarioDni:string,request:{usuarioNombresApellidos:string}){const {data}=await api.put<OperacionResponsable>(`/api/mantenimientos/responsables/${encodeURIComponent(usuarioDni)}`,request);return validarResponsable(data)}
export async function cambiarCargoResponsable(usuarioDni:string,request:{cargoId:number;fechaInicioCargo?:string|null}){const {data}=await api.put<OperacionResponsable>(`/api/mantenimientos/responsables/${encodeURIComponent(usuarioDni)}/cargo`,request);return validarResponsable(data)}
export async function obtenerHistorialCargosResponsable(usuarioDni:string){const {data}=await api.get<HistorialCargoResponsable[]>(`/api/mantenimientos/responsables/${encodeURIComponent(usuarioDni)}/historial-cargos`);return data}
export async function cambiarEstadoResponsable(usuarioDni:string,estado:boolean){const {data}=await api.patch<OperacionResponsable>(`/api/mantenimientos/responsables/${encodeURIComponent(usuarioDni)}/estado`,{estado});return validarResponsable(data)}

export async function agregarCargoHistoricoResponsable(usuarioDni:string,request:{cargoId:number;fechaInicio?:string|null;fechaFin?:string|null}){const {data}=await api.post<OperacionResponsable>(`/api/mantenimientos/responsables/${encodeURIComponent(usuarioDni)}/historial-cargos`,request);return validarResponsable(data)}
export async function editarCargoHistoricoResponsable(usuarioCargoHistorialId:number,request:{cargoId:number;fechaInicio?:string|null;fechaFin?:string|null}){const {data}=await api.put<OperacionResponsable>(`/api/mantenimientos/responsables/historial-cargos/${usuarioCargoHistorialId}`,request);return validarResponsable(data)}
