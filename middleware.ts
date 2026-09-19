import { NextRequest, NextResponse } from "next/server";
import { verificarSesion } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sesion")?.value;
  const valido = await verificarSesion(token);

  // Rutas de API (excepto login/logout)
  if (pathname.startsWith("/api")) {
    if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
      return NextResponse.next();
    }
    if (!valido) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const protegida =
    pathname === "/dashboard" || pathname.startsWith("/clientes") || pathname === "/";

  if (protegida) {
    if (!valido) {
      const login = new URL("/login", req.url);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && valido) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/clientes/:path*", "/login", "/api/:path*"],
};