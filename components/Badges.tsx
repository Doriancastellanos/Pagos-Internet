export function BadgeEstado({ estado }: { estado: "al_dia" | "pendiente" }) {
  if (estado === "al_dia") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
        Al día
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
      Pendiente
    </span>
  );
}