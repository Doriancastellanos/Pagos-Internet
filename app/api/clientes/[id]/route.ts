import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aClienteDTO } from "@/lib/pagos";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cliente = await prisma.client.findUnique({
      where: { id },
      include: { pagos: true },
    });
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ cliente: aClienteDTO(cliente) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al leer el cliente" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existe = await prisma.client.findUnique({ where: { id } });
    if (!existe) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const datos: Record<string, unknown> = {};
    if (typeof body.nombre === "string" && body.nombre.trim()) datos.nombre = body.nombre.trim();
    if (typeof body.telefono === "string") datos.telefono = body.telefono.trim() || null;
    if (typeof body.direccion === "string") datos.direccion = body.direccion.trim() || null;
    if (typeof body.precio === "number" && Number.isFinite(body.precio)) datos.precio = body.precio;
    if (typeof body.notas === "string") datos.notas = body.notas.trim() || null;
    if (Number.isFinite(Number(body.lat)) && Number.isFinite(Number(body.lng))) {
      datos.lat = Number(body.lat);
      datos.lng = Number(body.lng);
    }

    const cliente = await prisma.client.update({ where: { id }, data: datos });
    return NextResponse.json({ ok: true, id: cliente.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo actualizar el cliente" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existe = await prisma.client.findUnique({ where: { id } });
    if (!existe) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo eliminar el cliente" }, { status: 500 });
  }
}