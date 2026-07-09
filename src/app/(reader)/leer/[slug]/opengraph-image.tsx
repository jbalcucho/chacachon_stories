import { ImageResponse } from "next/og";
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
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #2a3d6e 0%, #16213e 100%)",
          color: "#fdf6e3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#f4b942" }}>
          ✦ Las historias de Chacachón
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: "980px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#e7c98f",
            maxWidth: "960px",
          }}
        >
          {moraleja ?? "Cuentos hiperlocalizados para leer en familia."}
        </div>
      </div>
    ),
    { ...size },
  );
}
