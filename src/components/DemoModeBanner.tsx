import Link from "next/link";

type Props = {
  /** Ruta de retorno tras login (ej. `/` o `/leer/slug`). */
  loginCallbackUrl?: string;
  /** Versión compacta para el lector. */
  compact?: boolean;
};

/**
 * Aviso cuando el usuario lee o arma recetas con la familia demo Chacachón.
 * El motor ya usa `perfiles/familia-chacachon.json`; este componente solo comunica el estado.
 */
export default function DemoModeBanner({
  loginCallbackUrl = "/",
  compact = false,
}: Props) {
  const loginHref = `/login?callbackUrl=${encodeURIComponent(loginCallbackUrl)}`;

  if (compact) {
    return (
      <p className="story-reader__demo-hint" role="status">
        Familia demo ·{" "}
        <Link href={loginHref} className="story-reader__demo-link">
          Usar mi familia
        </Link>
      </p>
    );
  }

  return (
    <p className="crear-banner crear-banner--info crear-banner--guest" role="status">
      <Link href={loginHref} className="crear-banner__soft-link">
        Regístrate o inicia sesión
      </Link>{" "}
      para crear histor
      <span className="title-ia" title="Historias con inteligencia artificial">
        IA
      </span>
      s personalizadas.
    </p>
  );
}
