import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adaptar cuento",
  robots: { index: false },
};

const STEPS = [
  {
    title: "¿Qué quieres trabajar?",
    hint: "Dormir, pantallas, respeto, miedos…",
    status: "next",
  },
  {
    title: "Elige una plantilla",
    hint: "Operación a dormir, Cerditos del edificio…",
    status: "pending",
  },
  {
    title: "Vista previa para padres",
    hint: "Revisa el texto antes de leer en voz alta.",
    status: "pending",
  },
  {
    title: "Guardar en tu biblioteca",
    hint: "Solo tu familia verá el borrador hasta que lo apruebes.",
    status: "pending",
  },
];

export default function CrearAdaptarPage() {
  return (
    <main className="crear-main mx-auto max-w-xl px-4 py-6 pb-12 sm:px-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-honey-glow">
          Paso 1 de 4 · wireframe
        </p>
        <h1 className="title-display mt-2 text-2xl sm:text-3xl">
          Adaptar con tu familia
        </h1>
        <p className="intro-copy mt-2 text-sm">
          Aquí irá el asistente con IA. Por ahora puedes ver los pasos planeados.
        </p>
      </header>

      <ol className="crear-steps mt-8">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className={`crear-step${step.status === "next" ? " crear-step--active" : ""}`}
          >
            <span className="crear-step__num">{index + 1}</span>
            <div>
              <p className="crear-step__title">{step.title}</p>
              <p className="crear-step__hint">{step.hint}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="crear-banner crear-banner--info mt-8">
        La API de generación aún no está conectada. Este flujo valida la
        experiencia antes de invertir en prompts y costos.
      </div>

      <p className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/crear" className="font-semibold text-honey-glow">
          ← Hub crear
        </Link>
        <Link href="/" className="font-semibold text-cream-muted hover:text-cream">
          Biblioteca
        </Link>
      </p>
    </main>
  );
}
