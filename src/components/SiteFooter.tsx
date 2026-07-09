import Link from "next/link";
import BrandIllustration from "@/components/BrandIllustration";

export default function SiteFooter() {
  return (
    <footer className="site-footer border-t border-white/10 py-6 text-center text-sm text-cream-muted">
      <BrandIllustration variant="footer" className="site-footer__mark" />
      <p className="mt-3">
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
