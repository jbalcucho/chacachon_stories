import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: "Las historIAs de Chacachón",
    template: "%s | Chacachón",
  },
  description:
    "Cuentos infantiles hiperlocalizados con IA para leer en familia. Humor bogotano, personajes de la familia Chacachón.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Chacachón",
    title: "Las historIAs de Chacachón",
    description:
      "Cuentos para leer en familia con humor rolo y lecciones sin sermón.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2a3d6e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${nunito.variable} ${fredoka.variable}`}>
      <body className="page-bg flex min-h-screen flex-col font-sans text-cream">
        {children}
      </body>
    </html>
  );
}
