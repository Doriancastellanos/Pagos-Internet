import type { Client, Payment } from "../generated/postgres";
import { mesActual, proximoMes } from "./utils";

export type EstadoCliente = {
  status: "al_dia" | "pendiente";
  deudaMeses: string[];
  proximoPago: string | null;
  mesesPagados: number;
};

export function calcularEstadoCliente(
  pagos: Payment[],
  fechaIngreso?: Date | null
): EstadoCliente {
  const hoy = mesActual();
  const pagados = new Set(pagos.map((p) => p.periodo));

  const [hy, hm] = hoy.split("-").map(Number);
  const fin = new Date(hy, hm - 1, 1);

  const desde =
    fechaIngreso && !isNaN(new Date(fechaIngreso).getTime())
      ? new Date(fechaIngreso)
      : new Date();
  const cursor = new Date(desde.getFullYear(), desde.getMonth(), 1);

  const meses: string[] = [];
  while (cursor <= fin) {
    meses.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  if (meses.length === 0) meses.push(hoy);

  const deudaMeses = meses.filter((m) => !pagados.has(m));
  const alDia = !deudaMeses.includes(hoy);
  const proximoPago = alDia ? proximoMes(hoy) : deudaMeses[0];

  return {
    status: alDia ? "al_dia" : "pendiente",
    deudaMeses,
    proximoPago,
    mesesPagados: meses.filter((m) => pagados.has(m)).length,
  };
}

export function montoDeuda(clientes: { precio: number; estado: EstadoCliente }[]): number {
  return clientes.reduce(
    (suma, c) => suma + c.precio * c.estado.deudaMeses.length,
    0
  );
}

export function aClienteDTO(c: Client & { pagos: Payment[] }) {
  const estado = calcularEstadoCliente(c.pagos, c.createdAt);
  return {
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono,
    direccion: c.direccion,
    precio: c.precio,
    notas: c.notas,
    lat: c.lat,
    lng: c.lng,
    creado: c.createdAt.toISOString(),
    pagos: c.pagos.map((p) => ({
      id: p.id,
      periodo: p.periodo,
      monto: p.monto,
      nota: p.nota,
      fecha: p.createdAt.toISOString(),
    })),
    estado,
  };
}