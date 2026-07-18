import type { NextConfig } from "next";
import storyRedirectsJson from "./src/data/story-redirects.json";

type StoryRedirect = {
  source: string;
  destination: string;
};

const storyRedirects = storyRedirectsJson as StoryRedirect[];

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const config: NextConfig = {
  env: {
    // Sello de versión visible en el footer: fecha de build + commit corto
    // (VERCEL_GIT_COMMIT_SHA existe en builds de Vercel; en local queda "dev").
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_COMMIT_SHA:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
  },
  // Los cuentos se leen con readFile en runtime; sin esto Vercel no los empaqueta
  // en la función serverless y /leer/[slug] falla con ENOENT en producción.
  outputFileTracingIncludes: {
    "/leer/[slug]": ["./cuentos/**/*"],
  },
  async redirects() {
    return storyRedirects.map((entry) => ({
      source: entry.source,
      destination: entry.destination,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default config;
