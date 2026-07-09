import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">
        📖
      </p>
      <h1 className="title-display mt-4 text-3xl">No encontrado</h1>
      <p className="intro-copy mt-3 text-sm">
        Ese cuento o página no existe en la biblioteca.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl border-2 border-honey/45 bg-honey/20 px-6 py-3 text-sm font-bold text-honey-glow"
      >
        ← Biblioteca
      </Link>
    </main>
  );
}
