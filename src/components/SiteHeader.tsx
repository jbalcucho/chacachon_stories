"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LoginButton from "@/components/LoginButton";

export default function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");

    function onScroll() {
      if (!mobileQuery.matches) {
        setHidden(false);
        return;
      }

      const y = window.scrollY;
      if (y < 40) {
        setHidden(false);
      } else if (y > lastScrollY.current + 10) {
        setHidden(true);
      } else if (y < lastScrollY.current - 10) {
        setHidden(false);
      }
      lastScrollY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-50 border-b border-white/12 backdrop-blur-md${hidden ? " site-header--hidden" : ""}`}
    >
      <div className="site-header__inner mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:px-5 sm:py-3">
        <Link href="/" className="min-w-0">
          <p className="font-display truncate text-sm font-bold text-honey-glow sm:text-lg">
            Chacachón
          </p>
          <p className="site-header__tagline hidden text-xs font-semibold text-cream-muted sm:block">
            Cuentos en familia
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
