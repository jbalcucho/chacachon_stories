type SvgOptions = {
  id?: string;
  /** Fondo nocturno redondeado (favicon / OG). */
  withBackground?: boolean;
};

/** SVG del símbolo: luna creciente realista con libro abierto en su curva. */
export function renderBrandMarkSvg({
  id = "brand-mark",
  withBackground = false,
}: SvgOptions = {}): string {
  const moonLit = `${id}-moon-lit`;
  const moonShade = `${id}-moon-shade`;
  const haloOuter = `${id}-halo-outer`;
  const haloInner = `${id}-halo-inner`;
  const bookPages = `${id}-book-pages`;
  const bookRight = `${id}-book-right`;

  const bg = withBackground
    ? `<rect width="100" height="100" rx="22" fill="#141f3d"/>`
    : "";

  return `<svg class="brand-mark__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" overflow="visible" role="img" aria-hidden="true">
  <defs>
    <radialGradient id="${haloOuter}" cx="42%" cy="44%" r="58%">
      <stop offset="0%" stop-color="#FFE9B8" stop-opacity="0.5"/>
      <stop offset="55%" stop-color="#FFE9B8" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#FFE9B8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${haloInner}" cx="35%" cy="35%" r="55%">
      <stop offset="0%" stop-color="#FFFDF5" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#FFFDF5" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${moonLit}" cx="30%" cy="26%" r="80%">
      <stop offset="0%" stop-color="#FFFEF8"/>
      <stop offset="35%" stop-color="#FFE894"/>
      <stop offset="72%" stop-color="#F0B028"/>
      <stop offset="100%" stop-color="#C88010"/>
    </radialGradient>
    <radialGradient id="${moonShade}" cx="75%" cy="65%" r="50%">
      <stop offset="0%" stop-color="#A86808" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#A86808" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${bookPages}" cx="40%" cy="20%" r="85%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="55%" stop-color="#FFF8E8"/>
      <stop offset="100%" stop-color="#FFE8B8"/>
    </radialGradient>
    <linearGradient id="${bookRight}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8EE"/>
      <stop offset="100%" stop-color="#F5E0B0"/>
    </linearGradient>
    <mask id="${id}-moon-cut">
      <rect width="100" height="100" fill="white"/>
      <circle cx="60" cy="47" r="30.5" fill="black"/>
    </mask>
    <filter id="${id}-book-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="1.6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  ${bg}

  <!-- Estrellas discretas -->
  <g fill="#FFF9E8">
    <circle cx="84" cy="22" r="1" opacity="0.55"/>
    <circle cx="12" cy="30" r="0.85" opacity="0.45"/>
    <path d="M18 68 L18.5 69.2 L19.8 69.2 L18.7 70 L19.1 71.2 L18 70.5 L16.9 71.2 L17.3 70 L16.2 69.2 L17.5 69.2 Z" opacity="0.4"/>
  </g>

  <!-- Halos -->
  <circle cx="36" cy="50" r="46" fill="url(#${haloOuter})"/>
  <circle cx="36" cy="50" r="38" fill="url(#${haloInner})"/>

  <!-- Luna -->
  <g mask="url(#${id}-moon-cut)">
    <circle cx="36" cy="50" r="33" fill="url(#${moonLit})"/>
    <circle cx="36" cy="50" r="33" fill="url(#${moonShade})" opacity="0.75"/>
    <!-- Mares y cráteres sutiles -->
    <ellipse cx="24" cy="44" rx="7" ry="5.5" fill="rgba(210,165,80,0.14)" transform="rotate(-12 24 44)"/>
    <ellipse cx="28" cy="56" rx="5" ry="3.8" fill="rgba(180,130,50,0.12)" transform="rotate(8 28 56)"/>
    <ellipse cx="18" cy="52" rx="3.2" ry="2.6" fill="rgba(200,150,60,0.1)"/>
    <circle cx="30" cy="38" r="2.2" fill="rgba(255,250,230,0.35)"/>
    <circle cx="22" cy="48" r="1.4" fill="rgba(255,250,230,0.25)"/>
    <circle cx="32" cy="58" r="1.8" fill="rgba(160,110,40,0.15)"/>
    <!-- Borde iluminado -->
    <circle cx="36" cy="50" r="33" fill="none" stroke="rgba(255,248,220,0.35)" stroke-width="0.6"/>
  </g>

  <!-- Libro abierto en la curva de la luna -->
  <g transform="translate(48 46) rotate(-6 14 12)" filter="url(#${id}-book-glow)">
    <ellipse cx="14" cy="16" rx="16" ry="5" fill="rgba(255,240,200,0.45)"/>
    <!-- Sombra del libro sobre la luna -->
    <ellipse cx="14" cy="17" rx="14" ry="3.5" fill="rgba(160,110,40,0.15)"/>
    <!-- Lomo -->
    <path d="M4 8 C8 4 14 4 18 8 L18 22 C14 19 8 19 4 22 Z" fill="url(#${bookPages})" stroke="#D4A850" stroke-width="0.65"/>
    <path d="M18 8 C22 4 28 4 32 8 L32 22 C28 19 22 19 18 22 Z" fill="url(#${bookRight})" stroke="#D4A850" stroke-width="0.65"/>
    <line x1="18" y1="8" x2="18" y2="22" stroke="#C89830" stroke-width="1"/>
    <!-- Páginas -->
    <line x1="7" y1="11" x2="15" y2="10.5" stroke="#E8D8B0" stroke-width="0.55" opacity="0.75"/>
    <line x1="7" y1="14" x2="14" y2="13.5" stroke="#E8D8B0" stroke-width="0.55" opacity="0.75"/>
    <line x1="7" y1="17" x2="13" y2="16.5" stroke="#E8D8B0" stroke-width="0.55" opacity="0.65"/>
    <line x1="21" y1="10.5" x2="29" y2="11" stroke="#E8D8B0" stroke-width="0.55" opacity="0.75"/>
    <line x1="21" y1="13.5" x2="28" y2="14" stroke="#E8D8B0" stroke-width="0.55" opacity="0.75"/>
    <line x1="21" y1="16.5" x2="27" y2="17" stroke="#E8D8B0" stroke-width="0.55" opacity="0.65"/>
    <!-- Brillo de luz lunar en el borde -->
    <path d="M5 9 Q14 6 17 9" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="0.7" stroke-linecap="round"/>
  </g>
</svg>`;
}

export function brandMarkDataUrl(options?: SvgOptions): string {
  return `data:image/svg+xml,${encodeURIComponent(renderBrandMarkSvg(options))}`;
}
