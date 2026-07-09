import { ImageResponse } from "next/og";
import { OG_NIGHT_BG, OgBrandMark } from "@/lib/og-brand-mark";

export const alt = "Las historIAs de Chacachón — luna y cuento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SiteOpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "48px",
          background: OG_NIGHT_BG,
          color: "#fdf6e3",
          fontFamily: "sans-serif",
        }}
      >
        <OgBrandMark size={260} />
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#f4b942",
            textAlign: "center",
          }}
        >
          <span>Las histor</span>
          <span
            style={{
              color: "#ffe9b0",
              textShadow: "0 0 22px rgba(255, 236, 170, 0.9)",
            }}
          >
            IA
          </span>
          <span>s de Chacachón</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#e7c98f",
            textAlign: "center",
          }}
        >
          Cuentos para leer en familia · humor bogotano
        </div>
      </div>
    ),
    { ...size },
  );
}
