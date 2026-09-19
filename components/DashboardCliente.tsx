"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Nav from "./Nav";
import { MapaView } from "./map/MapaWrap";
import type { ClienteDTO } from "@/lib/tipos";
import { montoDeuda } from "@/lib/pagos";
import { formatearMes, moneda } from "@/lib/utils";

type Props = { clientes: ClienteDTO[] };

const FILTROS = [
  { id: "todos", nombre: "Todos" },
  { id: "al_dia", nombre: "Al día" },
  { id: "pendiente", nombre: "Pendientes" },
];

export default function DashboardCliente({ clientes }: Props) {
  const [filtro, setFiltro] = useState("todos");

  const visibles = useMemo(
    () => (filtro === "todos" ? clientes : clientes.filter((c) => c.estado.status === filtro)),
    [clientes, filtro]
  );

  const pendientes = useMemo(
    () =>
      clientes
        .filter((c) => c.estado.status === "pendiente")
        .sort((a, b) => b.estado.deudaMeses.length - a.estado.deudaMeses.length),
    [clientes]
  );

  const stats = useMemo(() => {
    const alDia = clientes.filter((c) => c.estado.status === "al_dia").length;
    return {
      total: clientes.length,
      alDia,
      pendientes: clientes.length - alDia,
      deuda: montoDeuda(clientes.map((c) => ({ precio: c.precio, estado: c.estado }))),
    };
  }, [clientes]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Nav activo="dashboard" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mapa de clientes</h1>
            <p className="text-sm text-slate-500">
              Ve quién ha pagado y quién tiene pagos pendientes
            </p>
          </div>
          <Link
            href="/clientes/nuevo"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Nuevo cliente
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card value={String(stats.total)} label="Clientes" />
          <Card value={String(stats.alDia)} label="Al día" color="text-green-700" dot="bg-green-500" />
          <Card value={String(stats.pendientes)} label="Pendientes" color="text-red-700" dot="bg-red-500" />
          <Card value={moneda(stats.deuda)} label="Deuda estimada" color="text-blue-700" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    filtro === f.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.nombre}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-green-600 shadow" /> Al día
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-red-600 shadow" /> Pendiente
              </span>
            </div>
          </div>
          <div className="grid min-h-[62vh] lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-h-[62vh] w-full">
              {clientes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-sm text-slate-500">
                    Aún no tienes clientes registrados.
                  </p>
                  <Link
                    href="/clientes/nuevo"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Registrar mi primer cliente
                  </Link>
                </div>
              ) : (
                <MapaView clientes={visibles} />
              )}
            </div>
            <aside className="border-t border-slate-200 bg-slate-50 p-4 lg:border-l lg:border-t-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900">Cobranza pendiente</h2>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  {pendientes.length}
                </span>
              </div>
              {pendientes.length === 0 ? (
                <p className="text-sm text-slate-500">Todos los clientes están al día.</p>
              ) : (
                <div className="space-y-2">
                  {pendientes.map((cliente) => (
                    <Link
                      key={cliente.id}
                      href={`/clientes/${cliente.id}`}
                      className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{cliente.nombre}</p>
                        <span className="shrink-0 text-xs font-semibold text-red-700">
                          {cliente.estado.deudaMeses.length} {cliente.estado.deudaMeses.length === 1 ? "mes" : "meses"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Falta: {cliente.estado.deudaMeses.map(formatearMes).join(", ")}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-blue-700">Registrar pago →</p>
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({
  value,
  label,
  color = "text-slate-900",
  dot,
}: {
  value: string;
  label: string;
  color?: string;
  dot?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {dot && <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />}
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}