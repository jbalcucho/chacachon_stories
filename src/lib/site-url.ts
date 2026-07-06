export function getSiteUrl(): string {
  const url =
    process.env.NEXTAUTH_URL ?? "https://chacachon-stories.vercel.app";
  return url.replace(/\/$/, "");
}
