import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { crearSesion } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const usuario = String(body.usuario || "");
    const contrasena = String(body.contrasena || "");

    const usuarioOk = process.env.ADMIN_USER || "admin";
    const contrasenaOk = process.env.ADMIN_PASSWORD || "admin123";

    const a = Buffer.from(usuario);
    const b = Buffer.from(usuarioOk);
    const c = Buffer.from(contrasena);
    const d = Buffer.from(contrasenaOk);

    const usuarioValido = a.length === b.length && timingSafeEqual(a, b);
    const contrasenaValida = c.length === d.length && timingSafeEqual(c, d);

    if (!usuarioValido || !contrasenaValida) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const token = await crearSesion();
    const res = NextResponse.json({ ok: true });
    res.cookies.set("sesion", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
}