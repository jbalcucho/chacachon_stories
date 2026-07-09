import { ImageResponse } from "next/og";
import { OG_NIGHT_BG, OgBrandIllustration } from "@/lib/og-brand-mark";
import { getPublishedStoryBySlug } from "@/lib/stories";

export const alt = "Un cuento de la familia Chacachón";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = {
  params: { slug: string };
};

export default async function OpengraphImage({ params }: ImageProps) {
  const story = await getPublishedStoryBySlug(params.slug).catch(() => null);
  const title = story?.title ?? "Las historias de Chacachón";
  const moraleja = story?.moraleja ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: OG_NIGHT_BG,
          color: "#fdf6e3",
          fontFamily: "sans-serif",
        }}
      >
        <OgBrandIllustration height={220} />
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            textAlign: "center",
            maxWidth: "980px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              color: "#f4b942",
            }}
          >
            <span>Las histor</span>
            <span style={{ color: "#ffe9b0" }}>IA</span>
            <span>s de Chacachón</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#e7c98f",
              textAlign: "center",
              maxWidth: "900px",
            }}
          >
            {moraleja ?? "Cuentos hiperlocalizados para leer en familia."}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
