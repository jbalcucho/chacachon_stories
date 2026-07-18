import Link from "next/link";
import BrandIllustration from "@/components/BrandIllustration";

function buildVersionLabel(): string {
  const sha = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev";
  const raw = process.env.NEXT_PUBLIC_BUILD_TIME;
  if (!raw) return `v. ${sha}`;
  const fecha = new Date(raw).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `v. ${sha} · ${fecha}`;
}

export default function SiteFooter() {
  return (
    <footer className="site-footer border-t border-white/10 py-4 sm:py-5">
      <div className="site-footer__row">
        <Link href="/" className="site-footer__brand">
          <BrandIllustration variant="compact" />
          <div className="site-footer__brand-text">
            <p className="font-display text-sm font-bold text-honey-glow sm:text-base">
              Chacachón
            </p>
            <p className="text-xs font-semibold text-cream-muted">
              Cuentos para leer en familia
            </p>
          </div>
        </Link>
        <Link href="/privacidad" className="site-footer__privacy">
          Privacidad
        </Link>
      </div>
      <p
        className="mt-2 text-center text-[10px] text-cream-muted/70"
        title="Versión desplegada: commit y fecha de build (hora de Bogotá)"
      >
        {buildVersionLabel()}
      </p>
    </footer>
  );
}
