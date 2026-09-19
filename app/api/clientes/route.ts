import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aClienteDTO } from "@/lib/pagos";

export async function GET() {
  try {
    const clientes = await prisma.client.findMany({
      include: { pagos: true },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json({ clientes: clientes.map(aClienteDTO) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al leer clientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = String(body.nombre || "").trim();
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Debes marcar la ubicación del cliente en el mapa" },
        { status: 400 }
      );
    }

    const cliente = await prisma.client.create({
      data: {
        nombre,
        lat,
        lng,
        telefono: body.telefono ? String(body.telefono).trim() : null,
        direccion: body.direccion ? String(body.direccion).trim() : null,
        precio: Number(body.precio) || 0,
        notas: body.notas ? String(body.notas).trim() : null,
      },
    });

    return NextResponse.json({ ok: true, id: cliente.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo crear el cliente" }, { status: 500 });
  }
}