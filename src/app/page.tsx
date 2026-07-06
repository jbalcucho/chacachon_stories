import StoryCardLink from "@/components/StoryCardLink";
import { getLibraryStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stories = await getLibraryStories();

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 pb-16 sm:py-10">
      <header className="mb-10 text-center">
        <div
          className="mb-3 text-5xl drop-shadow-[0_0_20px_rgba(232,196,122,0.35)]"
          aria-hidden="true"
        >
          🌙
        </div>
        <h1 className="title-gradient text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Las historias de Chacachón
        </h1>
        <p className="mx-auto mt-4 max-w-md font-serif text-base leading-relaxed text-night-soft">
          Cuentos para leer en voz alta con Nico, Simónchin, Pauleta y toda la
          familia. Bogotá, humor rolo y lecciones sin sermón.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["Bogotá", "Letra amplia", "Para leer en familia"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-gold/20 bg-white/6 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-wider text-gold-soft"
            >
              {label}
            </span>
          ))}
        </div>
      </header>

      <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-night-soft">
        Biblioteca
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {stories.map((story) => (
          <div
            key={story.slug}
            className={
              story.slug === "operacion-a-dormir" ? "sm:col-span-2" : undefined
            }
          >
            <StoryCardLink story={story} />
          </div>
        ))}
      </div>
    </main>
  );
}
