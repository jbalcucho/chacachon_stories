import Link from "next/link";
import LoginButton from "@/components/LoginButton";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-night/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="min-w-0">
          <p className="truncate text-sm font-bold text-gold-soft sm:text-base">
            Chacachón
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-night-soft">
            Cuentos en familia
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/privacidad"
            className="hidden text-xs text-night-soft hover:text-white sm:inline"
          >
            Privacidad
          </Link>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
