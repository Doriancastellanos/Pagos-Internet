"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CampoUbicacion from "./CampoUbicacion";
import type { Punto } from "./map/MapaWrap";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

type Props = {
  inicial?: {
    nombre?: string;
    telefono?: string | null;
    direccion?: string | null;
    precio?: number | null;
    notas?: string | null;
    lat?: number | null;
    lng?: number | null;
  } | null;
  clienteId?: string;
  botonLabel?: string;
  onGuardado?: () => void;
};

export default function FormularioCliente({
  inicial = null,
  clienteId,
  botonLabel = "Guardar cliente",
  onGuardado,
}: Props) {
  const router = useRouter();
  const [pos, setPos] = useState<Punto | null>(
    inicial?.lat != null && inicial.lng != null
      ? { lat: inicial.lat, lng: inicial.lng }
      : null
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pos) {
      setError("Marca la ubicación del cliente en el mapa.");
      return;
    }
    setGuardando(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const cuerpo = {
      nombre: fd.get("nombre"),
      telefono: fd.get("telefono"),
      direccion: fd.get("direccion"),
      precio: Number(fd.get("precio")) || 0,
      notas: fd.get("notas"),
      lat: pos.lat,
      lng: pos.lng,
    };

    try {
      const res = await fetch(clienteId ? `/api/clientes/${clienteId}` : "/api/clientes", {
        method: clienteId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Ocurrió un error al guardar");
        setGuardando(false);
        return;
      }
      router.refresh();
      if (onGuardado) {
        onGuardado();
      } else {
        router.push("/clientes");
      }
    } catch {
      setError("No se pudo guardar el cliente");
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="nombre">
            Nombre del cliente *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            defaultValue={inicial?.nombre || ""}
            placeholder="Ej. María López"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="text"
            defaultValue={inicial?.telefono || ""}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="precio">
            Precio mensual ($)
          </label>
          <input
            id="precio"
            name="precio"
            type="number"
            min="0"
            step="0.01"
            defaultValue={inicial?.precio || 0}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="direccion">
            Dirección
          </label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            defaultValue={inicial?.direccion || ""}
            placeholder="Ej. Calle López Cotilla 55"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notas">
            Notas
          </label>
          <textarea
            id="notas"
            name="notas"
            rows={2}
            defaultValue={inicial?.notas || ""}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Ubicación en el mapa *
        </label>
        <CampoUbicacion pos={pos} onChange={setPos} />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
      >
        {guardando ? "Guardando…" : botonLabel}
      </button>
    </form>
  );
}