import Link from "next/link";
import LoginButton from "@/components/LoginButton";

export default function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/12 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="min-w-0">
          <p className="font-display truncate text-base font-bold text-honey-glow sm:text-lg">
            Chacachón
          </p>
          <p className="text-xs font-semibold text-cream-muted">
            Cuentos en familia
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/familia"
            className="hidden text-xs font-semibold text-cream-muted transition hover:text-cream sm:inline"
          >
            Mi familia
          </Link>
          <Link
            href="/privacidad"
            className="hidden text-xs font-semibold text-cream-muted transition hover:text-cream sm:inline"
          >
            Privacidad
          </Link>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
