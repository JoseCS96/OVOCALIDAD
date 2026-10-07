import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, ArrowUp, Check, GripVertical, LockKeyhole, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { guardarDiseno, obtenerPlantilla, parametrosFt } from "./api";
import type { SeccionDiseno } from "./types";

const catalogo = [
  ["ENCABEZADO", "Encabezado"],
  ["DATOS_LOTE", "Datos del lote"],
  ["RESULTADOS", "Informe de ensayo"],
  ["ALMACENAMIENTO", "Condición de almacenamiento"],
  ["REFERENCIAS", "Referencias / métodos"],
  ["FIRMA", "Responsable / firma"],
  ["PIE", "Pie de página"],
] as const;

export default function CertificadoDisenadorPage() {
  const { id } = useParams();
  const plantillaId = Number(id);
  const nav = useNavigate();
  const plantilla = useQuery({
    queryKey: ["plantilla-certificado", plantillaId],
    queryFn: () => obtenerPlantilla(plantillaId),
    enabled: Number.isFinite(plantillaId),
  });
  const parametros = useQuery({
    queryKey: ["parametros-certificado-ft", plantilla.data?.versionFtId],
    queryFn: () => parametrosFt(plantilla.data!.versionFtId),
    enabled: !!plantilla.data?.versionFtId,
  });
  const [secciones, setSecciones] = useState<SeccionDiseno[]>([]);

  useEffect(() => {
    if (!plantilla.data) return;
    if (!plantilla.data.secciones.length) {
      setSecciones([]);
      return;
    }
    setSecciones(
      [...plantilla.data.secciones]
        .sort((a, b) => a.orden - b.orden)
        .map((s) => ({
          tipoSeccion: s.tipoSeccion,
          titulo: s.titulo ?? "",
          orden: s.orden,
          visible: s.visible,
          caracteristicas: plantilla.data!.caracteristicas
            .filter((c) => c.certificadoPlantillaSeccionId === s.certificadoPlantillaSeccionId)
            .sort((a, b) => a.orden - b.orden)
            .map((c) => ({ versionFtCaracteristicaId: c.versionFtCaracteristicaId, orden: c.orden })),
        })),
    );
  }, [plantilla.data]);

  const seleccionados = useMemo(
    () => new Set(secciones.flatMap((s) => s.caracteristicas.map((c) => c.versionFtCaracteristicaId))),
    [secciones],
  );
  const normalizar = (items: SeccionDiseno[]) =>
    items.map((s, i) => ({
      ...s,
      orden: i + 1,
      caracteristicas: s.caracteristicas.map((c, j) => ({ ...c, orden: j + 1 })),
    }));

  const guardar = useMutation({
    mutationFn: () => guardarDiseno(plantillaId, normalizar(secciones)),
  });

  const agregar = (tipoSeccion: string, titulo: string) =>
    setSecciones((actual) =>
      normalizar([...actual, { tipoSeccion, titulo, orden: actual.length + 1, visible: true, caracteristicas: [] }]),
    );

  const mover = (indice: number, delta: number) =>
    setSecciones((actual) => {
      const destino = indice + delta;
      if (destino < 0 || destino >= actual.length) return actual;
      const copia = [...actual];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return normalizar(copia);
    });

  const alternarParametro = (indiceSeccion: number, idParametro: number, obligatorio: boolean) =>
    setSecciones((actual) =>
      actual.map((s, indice) => {
        if (indice !== indiceSeccion) return s;
        const existe = s.caracteristicas.some((c) => c.versionFtCaracteristicaId === idParametro);
        if (existe && obligatorio) return s;
        const caracteristicas = existe
          ? s.caracteristicas.filter((c) => c.versionFtCaracteristicaId !== idParametro)
          : [...s.caracteristicas, { versionFtCaracteristicaId: idParametro, orden: s.caracteristicas.length + 1 }];
        return { ...s, caracteristicas: caracteristicas.map((c, i) => ({ ...c, orden: i + 1 })) };
      }),
    );

  if (plantilla.isLoading) return <PageContainer>Cargando diseñador...</PageContainer>;
  if (!plantilla.data) return <PageContainer>No se encontró la plantilla.</PageContainer>;

  return (
    <PageContainer className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-secondary)]">Certificación · Diseñador</p>
          <h1 className="mt-1 text-2xl font-semibold">{plantilla.data.nombre}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {plantilla.data.productoCodigo} · {plantilla.data.documentoCodigo} · FT v{plantilla.data.versionNumero}
          </p>
        </div>
        <Button variant="outline" onClick={() => nav("/certificacion/certificados")}><ArrowLeft />Volver</Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {!secciones.length && (
            <Card><CardContent className="p-8 text-center text-sm text-[var(--text-secondary)]">Agrega las secciones que formarán el certificado.</CardContent></Card>
          )}
          {secciones.map((seccion, indice) => (
            <Card key={indice}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="shrink-0 opacity-40" />
                  <Input
                    className="font-semibold"
                    value={seccion.titulo}
                    onChange={(e) => setSecciones((actual) => actual.map((s, i) => i === indice ? { ...s, titulo: e.target.value } : s))}
                  />
                  <Button size="sm" variant="outline" onClick={() => mover(indice, -1)}><ArrowUp /></Button>
                  <Button size="sm" variant="outline" onClick={() => mover(indice, 1)}><ArrowDown /></Button>
                  <Button size="sm" variant="outline" onClick={() => setSecciones((actual) => normalizar(actual.filter((_, i) => i !== indice)))}><Trash2 /></Button>
                </div>

                {seccion.tipoSeccion === "RESULTADOS" && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-3 text-sm font-medium">Parámetros disponibles según Ficha Técnica</p>
                    {parametros.isLoading ? <p className="text-sm">Cargando parámetros...</p> : (
                      <div className="space-y-4">
                        {Array.from(new Set((parametros.data ?? []).map((p) => p.tipoCaractDescripcion?.trim() || "OTROS"))).map((tipo) => {
                          const items = (parametros.data ?? []).filter((p) => (p.tipoCaractDescripcion?.trim() || "OTROS") === tipo);
                          return (
                            <div key={tipo} className="overflow-hidden rounded-lg border bg-white">
                              <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2">
                                <span className="text-xs font-semibold tracking-wide text-slate-700">{tipo}</span>
                                <span className="text-xs text-[var(--text-secondary)]">{items.length} parámetro{items.length === 1 ? "" : "s"}</span>
                              </div>
                              <div className="space-y-2 p-2">
                                {items.map((parametro) => {
                                  const activo = seccion.caracteristicas.some((x) => x.versionFtCaracteristicaId === parametro.versionFtCaracteristicaId);
                                  const ocupado = seleccionados.has(parametro.versionFtCaracteristicaId) && !activo;
                                  return (
                                    <button
                                      type="button"
                                      disabled={ocupado}
                                      key={parametro.versionFtCaracteristicaId}
                                      onClick={() => alternarParametro(indice, parametro.versionFtCaracteristicaId, parametro.obligatorioCertificado)}
                                      className={"flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition hover:bg-slate-50 " + (activo ? "border-slate-500 bg-slate-50 " : "") + (ocupado ? "opacity-40 " : "")}
                                    >
                                      <span>
                                        <b>{parametro.determinacion}</b>
                                        <span className="ml-2 text-xs text-[var(--text-secondary)]">{parametro.unidadDeMedida || "Sin unidad"}</span>
                                      </span>
                                      <span>{parametro.obligatorioCertificado ? <LockKeyhole size={16} /> : activo ? <Check size={16} /> : null}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold">Agregar sección</h2>
              <div className="mt-3 space-y-2">
                {catalogo.map(([tipo, titulo]) => (
                  <Button key={tipo} variant="outline" className="w-full justify-start" onClick={() => agregar(tipo, titulo)}>
                    <Plus />{titulo}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold">Regla de certificación</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Solo se muestran parámetros habilitados para impresión en la Ficha Técnica. Los obligatorios no pueden excluirse.
              </p>
            </CardContent>
          </Card>
          <Button className="w-full" disabled={!secciones.length || guardar.isPending} onClick={() => guardar.mutate()}>
            <Save />{guardar.isPending ? "Guardando..." : "Guardar diseño"}
          </Button>
          {guardar.isSuccess && <p className="text-sm text-emerald-700">Diseño guardado correctamente.</p>}
          {guardar.isError && <p className="text-sm text-red-600">{guardar.error instanceof Error ? guardar.error.message : "No se pudo guardar."}</p>}
        </div>
      </div>
    </PageContainer>
  );
}
