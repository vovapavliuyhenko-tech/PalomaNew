import type { NextConfig } from "next";

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
  async redirects() {
    return [
      { source: "/cafe", destination: "/coffee", permanent: true },
      { source: "/weddings", destination: "/wedding", permanent: true },
      { source: "/gift-cards", destination: "/catalog/gift-cards", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseHostParsed
        ? [{ protocol: "https" as const, hostname: supabaseHostParsed }]
        : []),
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
