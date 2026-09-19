import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { aClienteDTO } from "@/lib/pagos";
import DetalleCliente from "@/components/DetalleCliente";

export const dynamic = "force-dynamic";

export default async function DetalleClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.client.findUnique({
    where: { id },
    include: { pagos: true },
  });

  if (!cliente) notFound();

  return <DetalleCliente cliente={aClienteDTO(cliente)} />;
}