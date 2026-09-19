import Nav from "@/components/Nav";
import FormularioCliente from "@/components/FormularioCliente";

export default function NuevoClientePage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Nav activo="clientes" />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">Nuevo cliente</h1>
          <p className="text-sm text-slate-500">
            Registra los datos y marca su ubicación en el mapa
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FormularioCliente botonLabel="Registrar cliente" />
        </div>
      </main>
    </div>
  );
}