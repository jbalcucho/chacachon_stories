import { ImageResponse } from "next/og";

export const alt = "Las historIAs de Chacachón";
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
          gap: 34,
          background: "linear-gradient(135deg, #2a3d6e 0%, #16213e 100%)",
          color: "#fdf6e3",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: 160,
            height: 160,
            borderRadius: 42,
            background: "#16224a",
            boxShadow: "0 0 60px rgba(255, 210, 110, 0.35)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 27,
              top: 23,
              width: 114,
              height: 114,
              borderRadius: "50%",
              background: "radial-gradient(circle at 34% 30%, #FFF9E8 0%, #FFE08A 45%, #E8A820 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 61,
              top: 30,
              width: 99,
              height: 99,
              borderRadius: "50%",
              background: "#16224a",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#f4b942",
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
        <div style={{ display: "flex", fontSize: 32, color: "#e7c98f" }}>
          Cuentos para leer en familia · humor bogotano
        </div>
      </div>
    ),
    { ...size },
  );
}
