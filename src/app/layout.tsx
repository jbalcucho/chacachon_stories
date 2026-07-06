import type { Metadata, Viewport } from "next";
import { Literata, Nunito } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: "Las historias de Chacachón",
    template: "%s | Chacachón",
  },
  description:
    "Cuentos infantiles hiperlocalizados para leer en familia. Humor bogotano, personajes de la familia Chacachón.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Chacachón",
    title: "Las historias de Chacachón",
    description:
      "Cuentos para leer en voz alta con humor rolo y lecciones sin sermón.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12141c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${nunito.variable} ${literata.variable}`}>
      <body className="page-bg flex min-h-screen flex-col font-sans text-[#f4f0ea]">
        <AuthProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
