import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existe = await prisma.payment.findUnique({ where: { id } });
    if (!existe) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const datos: Record<string, unknown> = {};
    if (typeof body.monto === "number" && Number.isFinite(body.monto) && body.monto > 0) {
      datos.monto = body.monto;
    }
    if (typeof body.nota === "string") datos.nota = body.nota.trim() || null;
    if (typeof body.periodo === "string" && /^\d{4}-\d{2}$/.test(body.periodo)) {
      datos.periodo = body.periodo;
    }

    try {
      const pago = await prisma.payment.update({ where: { id }, data: datos });
      return NextResponse.json({ ok: true, id: pago.id });
    } catch (e: unknown) {
      if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe un pago para ese mes" },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo actualizar el pago" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existe = await prisma.payment.findUnique({ where: { id } });
    if (!existe) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }
    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo eliminar el pago" }, { status: 500 });
  }
}