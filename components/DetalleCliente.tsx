"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "./Nav";
import { BadgeEstado } from "./Badges";
import { MapaView } from "./map/MapaWrap";
import FormularioCliente from "./FormularioCliente";
import type { ClienteDTO } from "@/lib/tipos";
import { formatearFecha, formatearMes, mesActual, moneda } from "@/lib/utils";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

type Props = { cliente: ClienteDTO };

export default function DetalleCliente({ cliente }: Props) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [agregandoPago, setAgregandoPago] = useState(false);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  async function registrarPago(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardandoPago(true);
    setErrorPago(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: cliente.id,
          periodo: fd.get("periodo"),
          monto: Number(fd.get("monto")) || 0,
          nota: fd.get("nota"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorPago(data.error || "No se pudo registrar el pago");
        setGuardandoPago(false);
        return;
      }
      setAgregandoPago(false);
      router.refresh();
    } catch {
      setErrorPago("No se pudo registrar el pago");
      setGuardandoPago(false);
    }
  }

  async function eliminarPago(id: string, periodo: string) {
    if (!window.confirm(`¿Eliminar el pago de ${formatearMes(periodo)}?`)) return;
    const res = await fetch(`/api/pagos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else window.alert("No se pudo eliminar el pago");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Nav activo="clientes" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{cliente.nombre}</h1>
              <BadgeEstado estado={cliente.estado.status} />
            </div>
            <div className="mt-1 space-y-0.5 text-sm text-slate-600">
              {cliente.telefono && <p>Tel: {cliente.telefono}</p>}
              {cliente.direccion && <p>{cliente.direccion}</p>}
              <p>
                Precio mensual: <b>{moneda(cliente.precio)}</b>
              </p>
              {cliente.notas && <p className="text-slate-500">Notas: {cliente.notas}</p>}
              {cliente.estado.status === "pendiente" && cliente.estado.proximoPago && (
                <p className="font-medium text-red-700">
                  Debe {cliente.estado.deudaMeses.length}{" "}
                  {cliente.estado.deudaMeses.length === 1 ? "mes" : "meses"}:{" "}
                  {cliente.estado.deudaMeses.map(formatearMes).join(", ")}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditando((v) => !v)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {editando ? "Cancelar edición" : "Editar cliente"}
          </button>
        </div>

        {editando && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Editar cliente</h2>
            <FormularioCliente
              clienteId={cliente.id}
              inicial={cliente}
              botonLabel="Guardar cambios"
              onGuardado={() => setEditando(false)}
            />
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-semibold text-slate-900">Historial de pagos</h2>
              </div>
              <div className="px-4 py-3">
                <div className="mb-3 flex justify-end">
                  <button
                    onClick={() => setAgregandoPago((v) => !v)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {agregandoPago ? "Cancelar" : "+ Registrar pago"}
                  </button>
                </div>

                {agregandoPago && (
                  <form
                    onSubmit={registrarPago}
                    className="mb-4 space-y-3 rounded-xl bg-slate-50 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="periodo">
                          Mes que paga
                        </label>
                        <input
                          id="periodo"
                          name="periodo"
                          type="month"
                          defaultValue={mesActual()}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="monto">
                          Monto ($)
                        </label>
                        <input
                          id="monto"
                          name="monto"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={cliente.precio || 0}
                          required
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="nota">
                        Nota (opcional)
                      </label>
                      <input id="nota" name="nota" type="text" className={inputCls} />
                    </div>
                    {errorPago && <p className="text-sm text-red-700">{errorPago}</p>}
                    <button
                      type="submit"
                      disabled={guardandoPago}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {guardandoPago ? "Guardando…" : "Guardar pago"}
                    </button>
                  </form>
                )}

                {cliente.pagos.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">
                    Sin pagos registrados todavía.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {cliente.pagos
                      .slice()
                      .sort((a, b) => b.periodo.localeCompare(a.periodo))
                      .map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {formatearMes(p.periodo)}{" "}
                              <span className="font-normal text-slate-500">· {moneda(p.monto)}</span>
                            </p>
                            {p.nota && <p className="text-xs text-slate-500">{p.nota}</p>}
                            <p className="text-xs text-slate-400">
                              Registrado el {formatearFecha(p.fecha)}
                            </p>
                          </div>
                          <button
                            onClick={() => eliminarPago(p.id, p.periodo)}
                            className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-semibold text-slate-900">Ubicación</h2>
              </div>
              <div className="h-80 w-full">
                <MapaView clientes={[cliente]} resaltarId={cliente.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}