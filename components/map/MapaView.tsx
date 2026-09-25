"use client";

import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useMiUbicacion } from "./useMiUbicacion";
import type { ClienteDTO } from "@/lib/tipos";
import { formatearMes } from "@/lib/utils";
import { BadgeEstado } from "@/components/Badges";

export type Punto = { lat: number; lng: number };

type Props = {
  clientes?: ClienteDTO[];
  pos?: Punto | null;
  onPick?: (p: Punto) => void;
  resaltarId?: string | null;
  mostrarMiUbicacion?: boolean;
};

const COLORES: Record<string, string> = {
  al_dia: "#16a34a",
  pendiente: "#dc2626",
};

function icono(color: string, grande?: boolean) {
  const tam = grande ? 28 : 22;
  return L.divIcon({
    className: "",
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam / 2],
    popupAnchor: [0, -tam / 2 - 6],
    html: `<div style="width:${tam}px;height:${tam}px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45)"></div>`,
  });
}

function iconoMiUbicacion() {
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div class="ubi-punto"><span class="ubi-anillo"></span><span class="ubi-nucleo"></span></div>`,
  });
}

function Clicky({ onPick }: { onPick: (p: Punto) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Fit({
  clientes,
  pos,
  miUbicacion,
}: {
  clientes?: ClienteDTO[];
  pos?: Punto | null;
  miUbicacion?: Punto | null;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const puntos: [number, number][] = (clientes?.length
      ? clientes.map((c) => [c.lat, c.lng] as [number, number])
      : []
    )
      .concat(pos ? [[pos.lat, pos.lng]] : [])
      .concat(miUbicacion ? [[miUbicacion.lat, miUbicacion.lng]] : []);

    if (!puntos.length) return;

    const lats = puntos.map((p) => p[0]);
    const lngs = puntos.map((p) => p[1]);
    const latUnica = new Set(lats.map((x) => Math.round(x * 100))).size <= 1;
    const lngUnica = new Set(lngs.map((x) => Math.round(x * 100))).size <= 1;

    if (latUnica && lngUnica) {
      map.setView([lats[0], lngs[0]], 15);
      return;
    }
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [35, 35] }
    );
  }, [clientes, pos, miUbicacion, map]);

  return null;
}

export function MapaView({
  clientes,
  pos,
  onPick,
  resaltarId,
  mostrarMiUbicacion = true,
}: Props) {
  const miUbicacion = useMiUbicacion(mostrarMiUbicacion);
  return (
    <MapContainer
      center={[20.6668, -103.3918]}
      zoom={12}
      className="h-full w-full"
      zoomControl={!onPick}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onPick && <Clicky onPick={onPick} />}
      {onPick && pos && <Marker position={[pos.lat, pos.lng]} icon={icono("#2563eb", true)} />}
      {clientes?.map((c) => (
        <Marker
          key={c.id}
          position={[c.lat, c.lng]}
          icon={icono(COLORES[c.estado.status] || "#ca8a04", resaltarId === c.id)}
        >
          <Popup>
            <div className="min-w-44">
              <p className="mb-1 font-semibold text-slate-900">{c.nombre}</p>
              <BadgeEstado estado={c.estado.status} />
              {c.telefono && <p className="mt-1 text-xs text-slate-700">Tel: {c.telefono}</p>}
              {c.direccion && <p className="text-xs text-slate-600">{c.direccion}</p>}
              {c.estado.status === "pendiente" && (
                <p className="mt-1.5 text-xs text-slate-700">
                  Le falta: <b className="text-red-700">{c.estado.deudaMeses.map(formatearMes).join(", ")}</b>
                </p>
              )}
              {c.estado.status === "al_dia" && (
                <p className="mt-1.5 text-xs text-green-700">Pago cubierto hasta la fecha</p>
              )}
              <Link
                href={`/clientes/${c.id}`}
                className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
              >
                Ver detalle →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {mostrarMiUbicacion && miUbicacion.estado === "activo" && miUbicacion.pos && (
        <Marker
          position={[miUbicacion.pos.lat, miUbicacion.pos.lng]}
          icon={iconoMiUbicacion()}
          zIndexOffset={1000}
        />
      )}
      <Fit
        clientes={clientes}
        pos={pos}
        miUbicacion={!onPick && miUbicacion.estado === "activo" ? miUbicacion.pos : null}
      />
    </MapContainer>
  );
}