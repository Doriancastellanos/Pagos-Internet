import type { EstadoCliente } from "./pagos";

export type PagoDTO = {
  id: string;
  periodo: string;
  monto: number;
  nota: string | null;
  fecha: string;
};

export type ClienteDTO = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  precio: number;
  notas: string | null;
  lat: number;
  lng: number;
  creado: string;
  pagos: PagoDTO[];
  estado: EstadoCliente;
};