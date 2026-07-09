import Link from "next/link";
import BrandIllustration from "@/components/BrandIllustration";

export default function SiteFooter() {
  return (
    <footer className="site-footer border-t border-white/10 py-6 text-center text-sm text-cream-muted">
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
      <p className="mt-4">
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
