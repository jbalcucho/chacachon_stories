import { brandMarkDataUrl } from "@/lib/brand-mark-svg";

type Props = {
  size?: number;
  /** Fondo redondeado en el SVG (favicon). En OG usar false y dejar el gradiente de la tarjeta. */
  withBackground?: boolean;
};

/** Insignia luna + libro para imágenes Open Graph (next/og). */
export function OgBrandMark({ size = 84, withBackground = false }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG embebido para OG (Satori)
    <img
      src={brandMarkDataUrl({ id: "og-brand", withBackground })}
      alt=""
      width={size}
      height={size}
      style={{
        display: "flex",
        flexShrink: 0,
      }}
    />
  );
}

/** Gradiente nocturno compartido por las tarjetas OG. */
export const OG_NIGHT_BG =
  "linear-gradient(160deg, #2a3d6e 0%, #1a2848 45%, #141f3d 100%)";
