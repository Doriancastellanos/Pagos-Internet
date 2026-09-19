import Link from "next/link";
import { prisma } from "@/lib/db";
import { aClienteDTO } from "@/lib/pagos";
import Nav from "@/components/Nav";
import TablaClientes from "@/components/TablaClientes";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.client.findMany({
    include: { pagos: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <Nav activo="clientes" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inventario de clientes</h1>
            <p className="text-sm text-slate-500">Razón social, teléfono y estado de pago</p>
          </div>
          <Link
            href="/clientes/nuevo"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Nuevo cliente
          </Link>
        </div>
        <TablaClientes clientes={clientes.map(aClienteDTO)} />
      </main>
    </div>
  );
}