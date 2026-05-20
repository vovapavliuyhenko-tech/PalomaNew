import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import LegalArticle from "@/components/layout/LegalArticle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { definePageMeta } from "@/lib/seo";

export const metadata: Metadata = definePageMeta({
  title: "О PALOMA",
  description:
    "PALOMA flowers coffee you — образ жизни, цветочная студия и café в Новороссийске. Забота, эстетика и свежие сезонные цветы.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd items={[{ name: "Главная", path: "/" }, { name: "О нас", path: "/about" }]} />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "О нас" }]}
        title="PALOMA flowers coffee you"
        eyebrow="О бренде"
        lead="Премиальный визуал, офлайн-пространство и кофе — отдельный контент блока будет на следующем этапе"
      />
      <ScrollReveal>
        <LegalArticle maxWidthClass="max-w-3xl">
          <p>
            Мы рассказываем историю бренда, команду и миссию. Это заглушка этапа 1: здесь сохранится структура маршрута
            и SEO-рамка без маркетингового текста.
          </p>
        </LegalArticle>
      </ScrollReveal>
    </div>
  );
}
