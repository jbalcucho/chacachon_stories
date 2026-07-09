export default function LeerLoading() {
  return (
    <div className="story-reader">
      <div className="story-reader__night" aria-hidden="true" />
      <header className="story-reader__toolbar">
        <span className="story-reader__back opacity-60">← Biblioteca</span>
        <span className="story-reader__toolbar-title opacity-60">Cargando…</span>
      </header>
      <article className="story-reader__article animate-pulse">
        <div className="mb-4 h-8 w-2/3 rounded bg-white/10" />
        <div className="mb-3 h-4 w-full rounded bg-white/8" />
        <div className="mb-3 h-4 w-full rounded bg-white/8" />
        <div className="h-4 w-4/5 rounded bg-white/8" />
      </article>
    </div>
  );
}
