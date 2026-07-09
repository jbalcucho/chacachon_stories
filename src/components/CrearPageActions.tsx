import Link from "next/link";

type CrearPageActionsProps = {
  showCrear?: boolean;
  showBiblioteca?: boolean;
};

export default function CrearPageActions({
  showCrear = true,
  showBiblioteca = true,
}: CrearPageActionsProps) {
  return (
    <nav className="crear-action-bar" aria-label="Ir a otra sección">
      {showCrear ? (
        <Link href="/crear" className="crear-action-btn crear-action-btn--primary">
          ← Volver a Crear
        </Link>
      ) : null}
      {showBiblioteca ? (
        <Link href="/" className="crear-action-btn crear-action-btn--secondary">
          Mi biblioteca
        </Link>
      ) : null}
    </nav>
  );
}
