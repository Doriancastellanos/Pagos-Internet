"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav({ activo }: { activo: string }) {
  const router = useRouter();

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const clases = (id: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      activo === id
        ? "bg-slate-700 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            IP
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Pagos de Internet</p>
            <p className="text-xs leading-tight text-slate-400">Control de cobros y ubicación</p>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          <Link href="/dashboard" className={clases("dashboard")}>
            Mapa
          </Link>
          <Link href="/clientes" className={clases("clientes")}>
            Clientes
          </Link>
          <button
            onClick={cerrarSesion}
            className="ml-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}