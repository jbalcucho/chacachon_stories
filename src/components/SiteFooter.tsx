import Link from "next/link";
import BrandIllustration from "@/components/BrandIllustration";

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
    </footer>
  );
}
