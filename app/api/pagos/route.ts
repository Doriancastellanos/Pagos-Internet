import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FORMATO_PERIODO = /^\d{4}-\d{2}$/;

function periodoValido(p: string): boolean {
  if (!FORMATO_PERIODO.test(p)) return false;
  const m = Number(p.slice(5, 7));
  return m >= 1 && m <= 12;
}

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get("clientId");
    const where = clientId ? { clientId } : {};
    const pagos = await prisma.payment.findMany({
      where,
      orderBy: { periodo: "desc" },
    });
    return NextResponse.json({ pagos });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al leer pagos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientId = String(body.clientId || "");
    const periodo = String(body.periodo || "");
    const monto = Number(body.monto);
    const nota = body.nota ? String(body.nota).trim() : null;

    if (!clientId || !periodoValido(periodo)) {
      return NextResponse.json({ error: "Datos del pago inválidos" }, { status: 400 });
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 });
    }

    const cliente = await prisma.client.findUnique({ where: { id: clientId } });
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    try {
      const pago = await prisma.payment.create({
        data: { clientId, periodo, monto, nota },
      });
      return NextResponse.json({ ok: true, id: pago.id }, { status: 201 });
    } catch (e: unknown) {
      if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
        return NextResponse.json(
          { error: "Ese cliente ya tiene un pago registrado para este mes" },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo registrar el pago" }, { status: 500 });
  }
}