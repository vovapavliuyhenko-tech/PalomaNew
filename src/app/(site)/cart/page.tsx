import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import { definePageMeta } from "@/lib/seo";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = definePageMeta({
  title: "Корзина",
  description: "Состав заказа PALOMA flowers coffee you · оформление доставки в Новороссийске",
  path: "/cart",
});

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd items={[{ name: "Главная", path: "/" }, { name: "Корзина", path: "/cart" }]} />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Корзина" }]}
        title="Корзина"
        lead="Фото перед отправкой · свежие сезонные цветы · доставка день-в-день по городу и побережью"
      />
      <CartPageClient />
    </div>
  );
}
