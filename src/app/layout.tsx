import type { Metadata, Viewport } from "next";
import { Fredoka, Literata, Nunito } from "next/font/google";
import RouteFadeReset from "@/components/RouteFadeReset";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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

/** Cuerpo del cuento en el lector: serif pensada para lectura larga (vs. Fredoka en títulos/UI). */
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  weight: ["400", "500", "600"],
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
  applicationName: "HistorIAs Chacachon",
  appleWebApp: {
    capable: true,
    title: "HistorIAs Chacachon",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Chacachón",
    title: "Las historIAs de Chacachón",
    description:
      "Cuentos para leer en familia con humor rolo y lecciones sin sermón.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Las historIAs de Chacachón — luna y cuento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Las historIAs de Chacachón",
    description:
      "Cuentos para leer en familia con humor rolo y lecciones sin sermón.",
    images: ["/opengraph-image"],
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
    <html
      lang="es"
      className={`${nunito.variable} ${fredoka.variable} ${literata.variable}`}
    >
      <body className="page-bg flex min-h-screen flex-col font-sans text-cream">
        <ServiceWorkerRegister />
        <RouteFadeReset />
        {children}
      </body>
    </html>
  );
}
