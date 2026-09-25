"use client";

import { useEffect, useState } from "react";
import type { Punto } from "./MapaView";

export type EstadoMiUbicacion =
  | "inactivo"
  | "solicitando"
  | "activo"
  | "rechazado"
  | "no_soportado";

export function useMiUbicacion(habilitado = true) {
  const [pos, setPos] = useState<Punto | null>(null);
  const [estado, setEstado] = useState<EstadoMiUbicacion>("inactivo");

  useEffect(() => {
    if (!habilitado) {
      setPos(null);
      setEstado("inactivo");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setEstado("no_soportado");
      return;
    }

    setEstado("solicitando");
    let activo = true;

    const id = navigator.geolocation.watchPosition(
      (p) => {
        if (!activo) return;
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setEstado("activo");
      },
      () => {
        if (!activo) return;
        setPos(null);
        setEstado("rechazado");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      activo = false;
      navigator.geolocation.clearWatch(id);
    };
  }, [habilitado]);

  return { pos, estado };
}
