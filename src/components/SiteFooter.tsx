import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer border-t border-white/10 py-5 text-center text-sm text-cream-muted">
      <p>
        <strong className="font-display font-semibold text-cream">Chacachón</strong>
        {" · "}
        Cuentos para leer en familia
      </p>
      <p className="mt-3">
        <Link
          href="/privacidad"
          className="font-semibold text-honey-glow underline-offset-2 hover:underline"
        >
          Política de privacidad
        </Link>
      </p>
    </footer>
  );
}
