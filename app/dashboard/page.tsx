import { prisma } from "@/lib/db";
import { aClienteDTO } from "@/lib/pagos";
import DashboardCliente from "@/components/DashboardCliente";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const clientes = await prisma.client.findMany({
    include: { pagos: true },
    orderBy: { nombre: "asc" },
  });

  return <DashboardCliente clientes={clientes.map(aClienteDTO)} />;
}