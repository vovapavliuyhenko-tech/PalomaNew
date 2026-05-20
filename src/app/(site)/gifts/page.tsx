import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import LegalArticle from "@/components/layout/LegalArticle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { definePageMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = definePageMeta({
  title: "Вазы, подарки и сертификаты",
  description:
    "Вазы и дополнения к букету, подарочные сертификаты PALOMA. Оформление в корзине с доставкой по городу.",
  path: "/gifts",
});

export default function GiftsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd items={[{ name: "Главная", path: "/" }, { name: "Подарки", path: "/gifts" }]} />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Вазы и подарки" }]}
        eyebrow={siteConfig.name}
        title="Вазы, подарки, сертификаты"
        lead="Дополняем букет вазой, открыткой и атрибутикой из каталога. Сертификат можно выбрать номиналом и оформить как обычный товар."
      />
      <ScrollReveal>
        <LegalArticle>
          <p className="mb-4">
            Ассортимент ваз и сопутствующих позиций — в{" "}
            <Link href="/catalog" className="text-[var(--color-cherry)] underline underline-offset-2">
              общем каталоге
            </Link>
            . Отдельная витрина{" "}
            <Link href="/catalog/gift-cards" className="text-[var(--color-cherry)] underline underline-offset-2">
              подарочных сертификатов
            </Link>{" "}
            : добавьте в корзину, оформите доставку или самовывоз — как для букета.
          </p>
          <p>
            Нужен бумажный конверт или нестандартный номинал — уточните в{" "}
            <Link href="/contacts" className="text-[var(--color-cherry)] underline underline-offset-2">
              контактах
            </Link>{" "}
            или в Telegram до оплаты.
          </p>
        </LegalArticle>
      </ScrollReveal>
    </div>
  );
}
