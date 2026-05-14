import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import ThemeInlineScript from "@/components/layout/ThemeInlineScript";
import { siteConfig } from "@/lib/siteConfig";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Paloma Flowers — Цветочный магазин в Новороссийске",
    template: "%s — Paloma Flowers",
  },
  description:
    "Премиальный цветочный магазин и кофейня в Новороссийске. Доставка букетов по Новороссийску, Геленджику и Анапе. Бесплатная доставка от 5 000 ₽.",
  keywords: ["цветы", "букеты", "Новороссийск", "доставка цветов", "Paloma Flowers"],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://paloma-flowers.ru",
    siteName: "Paloma Flowers",
    images: ["/og/default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <ThemeInlineScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Classical+One&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
          precedence="default"
        />
      </head>
      <body className={montserrat.variable}>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <LocalBusinessJsonLd />
        {children}
      </body>
    </html>
  );
}
