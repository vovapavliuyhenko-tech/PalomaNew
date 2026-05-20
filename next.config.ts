import type { NextConfig } from "next";

/** Сборка статики под GitHub Pages (`PALOMA` как имя репозитория → префикс `/PALOMA`). */
const isGhPagesExport = process.env.PALOMA_STATIC_EXPORT === "1";

function supabaseHost(): string | null {
  try {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!raw) return null;
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHostParsed = supabaseHost();

const nextConfig: NextConfig = {
  ...(isGhPagesExport
    ? {
        output: "export" as const,
        basePath: "/PALOMA",
        assetPrefix: "/PALOMA/",
        trailingSlash: true,
      }
    : {}),
  async redirects() {
    if (isGhPagesExport) return [];
    return [
      { source: "/cafe", destination: "/coffee", permanent: true },
      { source: "/weddings", destination: "/wedding", permanent: true },
      { source: "/gift-cards", destination: "/catalog/gift-cards", permanent: true },
    ];
  },
  images: {
    ...(isGhPagesExport ? { unoptimized: true } : { formats: ["image/avif", "image/webp"] }),
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseHostParsed
        ? [{ protocol: "https" as const, hostname: supabaseHostParsed }]
        : []),
    ],
  },
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
