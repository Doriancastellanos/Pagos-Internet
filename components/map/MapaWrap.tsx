"use client";

import dynamic from "next/dynamic";

export type { Punto } from "./MapaView";

export const MapaView = dynamic(
  () => import("./MapaView").then((m) => m.MapaView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
        Cargando mapa…
      </div>
    ),
  }
);