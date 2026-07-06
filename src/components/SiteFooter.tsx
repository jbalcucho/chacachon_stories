import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/6 py-8 text-center text-sm text-night-soft">
      <p>
        <strong className="font-semibold text-white">Chacachón</strong> · cuentos
        hiperlocalizados con amor familiar
      </p>
      <p className="mt-1">Hecho en Bogotá</p>
      <p className="mt-3">
        <Link href="/privacidad" className="underline-offset-2 hover:underline">
          Política de privacidad
        </Link>
      </p>
    </footer>
  );
}
