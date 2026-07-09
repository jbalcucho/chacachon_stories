/** Luna cálida para el hero — media luna suave, sin carita. */
export default function HeroMoon() {
  return (
    <div className="hero-moon">
      <span className="hero-moon__halo" aria-hidden="true" />
      <span className="hero-moon__halo hero-moon__halo--soft" aria-hidden="true" />
      <svg
        className="hero-moon__svg"
        viewBox="0 0 88 88"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hero-moon-fill" cx="34%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFF9E8" />
            <stop offset="45%" stopColor="#FFE08A" />
            <stop offset="100%" stopColor="#E8A820" />
          </radialGradient>
          <mask id="hero-moon-mask">
            <rect width="88" height="88" fill="white" />
            <circle cx="54" cy="44" r="25" fill="black" />
          </mask>
        </defs>

        <circle
          cx="40"
          cy="44"
          r="30"
          fill="url(#hero-moon-fill)"
          mask="url(#hero-moon-mask)"
        />
      </svg>
    </div>
  );
}
