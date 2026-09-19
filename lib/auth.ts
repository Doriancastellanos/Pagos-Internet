import { SignJWT, jwtVerify } from "jose";

const SECRETO = new TextEncoder().encode(
  process.env.AUTH_SECRET || "cambia-esta-clave-por-una-larga-y-aleatoria-9876543210"
);

export async function crearSesion(): Promise<string> {
  return await new SignJWT({ rol: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRETO);
}

export async function verificarSesion(token?: string | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRETO);
    return payload;
  } catch {
    return null;
  }
}