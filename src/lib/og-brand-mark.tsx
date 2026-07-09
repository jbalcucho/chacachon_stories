import {
  brandIllustrationDimensions,
} from "@/lib/brand-illustration";
import { getBrandIllustrationDataUrl } from "@/lib/brand-illustration-server";

type Props = {
  height?: number;
};

/** Ilustración luna + cuento para tarjetas Open Graph (next/og). */
export function OgBrandIllustration({ height = 260 }: Props) {
  const { width, height: h } = brandIllustrationDimensions(height);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- PNG embebido para OG (Satori)
    <img
      src={getBrandIllustrationDataUrl()}
      alt=""
      width={width}
      height={h}
      style={{
        display: "flex",
        flexShrink: 0,
        objectFit: "contain",
      }}
    />
  );
}

/** @deprecated Usar OgBrandIllustration */
export const OgBrandMark = OgBrandIllustration;

/** Gradiente nocturno compartido por las tarjetas OG. */
export const OG_NIGHT_BG =
  "linear-gradient(160deg, #2a3d6e 0%, #1a2848 45%, #141f3d 100%)";
