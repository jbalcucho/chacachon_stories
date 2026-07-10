import Link from "next/link";

type CrearPageActionsProps = {
  showCrear?: boolean;
  showBiblioteca?: boolean;
  showMisCuentos?: boolean;
};

export default function CrearPageActions({
  showCrear = true,
  showBiblioteca = true,
  showMisCuentos = true,
}: CrearPageActionsProps) {
  return (
    <nav className="crear-action-bar" aria-label="Ir a otra sección">
      {showCrear ? (
        <Link href="/crear" className="crear-action-btn crear-action-btn--primary">
          ← Volver a Crear
        </Link>
      ) : null}
      {showMisCuentos ? (
        <Link href="/mis-cuentos" className="crear-action-btn crear-action-btn--secondary">
          Mis cuentos
        </Link>
      ) : null}
      {showBiblioteca ? (
        <Link href="/" className="crear-action-btn crear-action-btn--secondary">
          Biblioteca Chacachón
        </Link>
      ) : null}
    </nav>
  );
}
