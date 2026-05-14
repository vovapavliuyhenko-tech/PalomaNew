import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LegalArticle from "@/components/layout/LegalArticle";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `Публичная оферта — ${siteConfig.legalName}`,
  robots: { index: false },
};

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Публичная оферта", path: "/offer" },
        ]}
      />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Публичная оферта" }]}
        title="Публичная оферта"
        maxWidthClass="max-w-4xl"
      />
      <ScrollReveal>
        <LegalArticle meta="Редакция от 1 января 2026 года">
          <h2>1. Предмет оферты</h2>
          <p>
            Настоящая публичная оферта (далее — «Оферта») является официальным предложением ИП {siteConfig.legalName}{" "}
            (далее — «Продавец») о заключении договора купли-продажи товаров и услуг через сайт{" "}
            {new URL(siteConfig.siteUrl).hostname}.
          </p>

          <h2>2. Акцепт оферты</h2>
          <p>
            Оформляя заказ на сайте или по телефону, покупатель принимает условия оферты в полном объёме. Акцепт
            осуществляется путём нажатия кнопки «Оплатить» и подтверждения заказа.
          </p>

          <h2>3. Товары и услуги</h2>
          <p>
            Продавец обязуется передать покупателю заказанные свежие цветы и сопутствующие товары в сроки, указанные
            при оформлении заказа.
          </p>

          <h2>4. Оплата</h2>
          <p>
            Оплата производится онлайн через платёжную систему до отправки заказа. Цены указаны в рублях, включая НДС.
          </p>

          <h2>5. Доставка</h2>
          <p>
            Доставка осуществляется по Новороссийску, Геленджику и Анапе в соответствии с условиями на странице
            «Доставка».
          </p>

          <h2>6. Возврат и обмен</h2>
          <p>
            Цветы являются скоропортящимся товаром. Замена или возврат осуществляется при ненадлежащем качестве товара
            в течение 24 часов с момента получения. Для возврата свяжитесь с нами по телефону или Telegram.
          </p>

          <h2>7. Контакты Продавца</h2>
          <p>
            ИП {siteConfig.legalName} · {siteConfig.address} · {siteConfig.phone} · {siteConfig.email}
          </p>
        </LegalArticle>
      </ScrollReveal>
    </div>
  );
}
