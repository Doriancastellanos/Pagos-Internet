"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeEstado } from "./Badges";
import type { ClienteDTO } from "@/lib/tipos";
import { formatearMes, moneda } from "@/lib/utils";

type Props = { clientes: ClienteDTO[] };

export default function TablaClientes({ clientes }: Props) {
  const router = useRouter();

  async function eliminar(id: string, nombre: string) {
    if (!window.confirm(`¿Eliminar a "${nombre}"? Se borrarán también sus pagos.`)) return;
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      window.alert("No se pudo eliminar el cliente");
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Teléfono</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Da pago de mes</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clientes.map((c) => (
            <tr key={c.id} className="transition hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link href={`/clientes/${c.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                  {c.nombre}
                </Link>
                {c.direccion && <p className="text-xs text-slate-500">{c.direccion}</p>}
              </td>
              <td className="px-4 py-3 text-slate-600">{c.telefono || "—"}</td>
              <td className="px-4 py-3 text-slate-700">{moneda(c.precio)}</td>
              <td className="px-4 py-3">
                <BadgeEstado estado={c.estado.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {c.estado.status === "al_dia"
                  ? "Al corriente"
                  : `Falta ${c.estado.deudaMeses.map(formatearMes).join(", ")}`}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Ver
                  </Link>
                  <button
                    onClick={() => eliminar(c.id, c.nombre)}
                    className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {clientes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                No hay clientes registrados todavía.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}