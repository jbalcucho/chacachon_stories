import { ImageResponse } from "next/og";
import { getPublishedStoryBySlug } from "@/lib/stories";

export const alt = "Un cuento de la familia Chacachón";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = {
  params: { slug: string };
};

function MoonBadge() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 84,
        height: 84,
        borderRadius: 22,
        background: "#16224a",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 12,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "radial-gradient(circle at 34% 30%, #FFF9E8 0%, #FFE08A 45%, #E8A820 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 16,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#16224a",
        }}
      />
    </div>
  );
}

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
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <MoonBadge />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#f4b942" }}>
            <span>Las histor</span>
            <span
              style={{
                color: "#ffe9b0",
                textShadow: "0 0 22px rgba(255, 236, 170, 0.95)",
              }}
            >
              IA
            </span>
            <span>s de Chacachón</span>
          </div>
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
