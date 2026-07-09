type Props = {
  /** Sufijo único para los IDs del SVG cuando la luna aparece más de una vez. */
  id?: string;
  className?: string;
};

/** Luna creciente que hace las veces de la "C" de Chacachón. Decorativa. */
export default function BrandMoonC({ id = "brand-moon", className }: Props) {
  const fillId = `${id}-fill`;
  const maskId = `${id}-mask`;

  return (
    <span className={`brand-moon${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg
        className="brand-moon__svg"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={fillId} cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#FFF9E8" />
            <stop offset="45%" stopColor="#FFE08A" />
            <stop offset="100%" stopColor="#E8A820" />
          </radialGradient>
          <mask id={maskId}>
            <rect width="100" height="100" fill="white" />
            <circle cx="72" cy="48" r="37" fill="black" />
          </mask>
        </defs>
        <circle
          cx="52"
          cy="50"
          r="48"
          fill={`url(#${fillId})`}
          mask={`url(#${maskId})`}
        />
      </svg>
    </span>
  );
}
