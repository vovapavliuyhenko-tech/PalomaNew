import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Truck, Clock, MapPin, Package, Store } from "lucide-react";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { siteConfig } from "@/lib/siteConfig";
import { formatPrice } from "@/lib/utils";
import { definePageMeta } from "@/lib/seo";
import {
  CITIES,
  DELIVERY_INTERVALS,
  DELIVERY_SURCHARGE_EXACT_TIME,
  DELIVERY_SURCHARGE_URGENCY,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/constants";

const novorossFree = formatPrice(FREE_DELIVERY_THRESHOLD);

/** Базовые тарифы и пороги в духе checkout / PRD (при отсутствии строк в БД на сервере действуют те же значения). */
const zones = [
  { city: "Новороссийск", price: "500 ₽", free: `от ${novorossFree}`, note: "" },
  { city: "Кабардинка", price: "800 ₽", free: "—", note: "" },
  { city: "Геленджик", price: "1 000 ₽", free: "—", note: "" },
  { city: "Анапа", price: "1 500 ₽", free: "—", note: "" },
  { city: "Краснодар", price: "1 500 ₽", free: "—", note: "по согласованию с менеджером" },
] as const;

export const metadata = definePageMeta({
  title: `Доставка цветов — ${siteConfig.legalName}`,
  description: `Доставка по ${siteConfig.city}, Кабардинке, Геленджику, Анапе и Красноду. Интервалы как при оформлении заказа. Самовывоз из салона. Бесплатная доставка в Новороссийске от ${novorossFree}.`,
  path: "/delivery",
});

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Доставка", path: "/delivery" },
        ]}
      />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Доставка" }]}
        eyebrow={`${siteConfig.city} и города доставки`}
        title="Доставка и самовывоз"
        lead={`Курьером по списку городов или самовывоз из салона. В Новороссийске доставка бесплатна от ${novorossFree} — как в корзине при оформлении.`}
      />

      <ScrollReveal>
        <div className="container mx-auto max-w-5xl py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="mb-16 grid grid-cols-2 gap-[var(--space-md)] md:grid-cols-4 md:gap-6">
            {[
              { icon: Truck, title: "День в день", desc: "При заказе до 15:00 — по возможности" },
              { icon: Clock, title: "Интервалы", desc: "Как при checkout: утро, день, вечер" },
              { icon: Package, title: "Фото перед отправкой", desc: "Согласуем сборку в мессенджере" },
              { icon: MapPin, title: `${CITIES.length} городов`, desc: CITIES.join(" · ") },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]">
                  <item.icon size={20} className="text-[var(--color-cherry)]" strokeWidth={1.5} />
                </div>
                <p className="mb-1 text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-14 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="mb-2 flex items-center gap-2">
              <Store size={20} className="text-[var(--color-cherry)]" strokeWidth={1.5} />
              <h2 className="text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 400 }}>
                Самовывоз
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Забрать заказ в бутике: {siteConfig.address}. Время — {siteConfig.workingHours}. Выберите «Самовывоз» при{" "}
              <Link href="/checkout" className="text-[var(--color-cherry)] underline underline-offset-2">
                оформлении
              </Link>
              .
            </p>
          </div>

          <h2 className="mb-6 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
            Города и базовая стоимость доставки
          </h2>
          <div className="mb-14 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-soft)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)]">
                  <th className="px-5 py-3.5 text-left font-medium text-[var(--text-primary)]">Город</th>
                  <th className="px-5 py-3.5 text-left font-medium text-[var(--text-primary)]">Тариф</th>
                  <th className="px-5 py-3.5 text-left font-medium text-[var(--text-primary)]">Бесплатно от</th>
                  <th className="px-5 py-3.5 text-left font-medium text-[var(--text-primary)]">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone, i) => (
                  <tr key={zone.city} className={i % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-secondary)]/60"}>
                    <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">{zone.city}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{zone.price}</td>
                    <td className="px-5 py-3.5 font-medium text-[var(--color-cherry)]">{zone.free}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{zone.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mb-6 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
            Временные интервалы
          </h2>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            При оформлении заказа выбирается один из интервалов ниже или пункт «Согласовать с менеджером».
          </p>
          <div className="mb-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {DELIVERY_INTERVALS.map((slot) => (
              <div
                key={slot.id}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <p className="mb-1 text-xs uppercase tracking-[var(--ls-widest)] text-[var(--color-cherry)]">
                  {slot.id === "call" ? "Гибко" : "Окно"}
                </p>
                <p className="mb-1 text-xl text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                  {slot.label}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5 md:p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">Надбавки при доставке:</strong> срочная доставка +{" "}
              {DELIVERY_SURCHARGE_URGENCY} ₽, при необходимости доставки к точному времени + {DELIVERY_SURCHARGE_EXACT_TIME}{" "}
              ₽ — опция на шаге оформления. Итоговая сумма считается так же, как в превью корзины.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
