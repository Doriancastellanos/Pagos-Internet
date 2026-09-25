"use client";

import { useState } from "react";
import { MapaView, type Punto } from "./map/MapaWrap";
import { useMiUbicacion } from "./map/useMiUbicacion";

type Props = {
  pos: Punto | null;
  onChange: (p: Punto) => void;
};

const MSJ_ESTADO: Record<string, string> = {
  solicitando: "Obteniendo tu ubicación…",
  rechazado: "No pudimos obtener tu ubicación. Activa el permiso de ubicación en tu navegador.",
  no_soportado: "Tu navegador no soporta la geolocalización.",
};

export default function CampoUbicacion({ pos, onChange }: Props) {
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const miUbicacion = useMiUbicacion(true);

  async function buscar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("direccion_busqueda") || "").trim();
    if (!q) return;
    setBuscando(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        { headers: { "User-Agent": "pagos-internet-app/1.0" } }
      );
      const datos = await res.json();
      if (Array.isArray(datos) && datos.length) {
        onChange({
          lat: parseFloat(datos[0].lat),
          lng: parseFloat(datos[0].lon),
        });
      } else {
        setError("No se encontró esa dirección. Intenta con más detalles o marca el punto en el mapa.");
      }
    } catch {
      setError("No se pudo buscar la dirección. Revisa tu conexión.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={buscar} className="flex gap-2">
        <input
          type="text"
          name="direccion_busqueda"
          placeholder="Buscar dirección (ej. Av. Juárez 100, Zapopan)…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={buscando}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => miUbicacion.pos && onChange(miUbicacion.pos)}
          disabled={miUbicacion.estado !== "activo" || !miUbicacion.pos}
          className="shrink-0 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {miUbicacion.estado === "solicitando"
            ? "Obteniendo tu ubicación…"
            : "Usar mi ubicación"}
        </button>
        {MSJ_ESTADO[miUbicacion.estado] && (
          <p className="text-xs text-slate-500">{MSJ_ESTADO[miUbicacion.estado]}</p>
        )}
      </div>
      <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-300">
        <MapaView pos={pos} onPick={onChange} />
      </div>
      <p className="text-xs text-slate-500">
        También puedes hacer clic sobre el mapa para marcar la ubicación exacta.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {pos && (
        <p className="text-xs text-slate-600">
          Ubicación seleccionada: {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}