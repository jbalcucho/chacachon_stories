import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 pb-16 font-serif text-sm leading-relaxed text-night-soft">
      <h1 className="font-sans text-2xl font-bold text-white">
        Política de privacidad
      </h1>
      <p className="mt-4">
        Chacachón recopila únicamente la información necesaria para personalizar
        cuentos infantiles para tu hogar: nombres, apodos, mascotas y detalles
        que tú decides compartir en el perfil familiar.
      </p>
      <p className="mt-4">
        Los datos se almacenan de forma segura en nuestra base de datos (Neon
        Postgres). No vendemos información personal.
      </p>
      <p className="mt-4">
        Si tienes cuenta, puedes{" "}
        <Link href="/familia" className="font-sans font-semibold text-honey-glow underline">
          exportar o eliminar tus datos
        </Link>{" "}
        desde la página Mi familia (Ley 1581 de 2012 — Habeas Data Colombia).
        También puedes escribir al administrador del servicio.
      </p>
      <p className="mt-4">
        Esta es una versión piloto. El texto legal definitivo se publicará antes
        del lanzamiento comercial.
      </p>
    </main>
  );
}
