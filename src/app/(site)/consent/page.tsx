import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LegalArticle from "@/components/layout/LegalArticle";
import { siteConfig } from "@/lib/siteConfig";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: `Согласие на обработку персональных данных — ${siteConfig.legalName}`,
  robots: { index: false },
};

export default function ConsentPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Согласие на обработку ПДн", path: "/consent" },
        ]}
      />
      <PageHero
        crumbs={[
          { name: "Главная", href: "/" },
          { name: "Согласие на обработку персональных данных" },
        ]}
        title="Согласие на обработку персональных данных"
        maxWidthClass="max-w-4xl"
      />
      <ScrollReveal>
        <LegalArticle>
          <p>
            Настоящим я, действуя свободно, своей волей и в своём интересе, даю согласие ИП {siteConfig.legalName} на
            обработку следующих персональных данных: ФИО, номер телефона, адрес электронной почты, Telegram-аккаунт,
            адрес доставки.
          </p>

          <p>
            Обработка осуществляется в целях оказания услуг по продаже цветов и их доставке, а также информирования о
            статусе заказа.
          </p>

          <p>
            Срок действия согласия: бессрочно, до его отзыва. Отзыв согласия осуществляется путём направления
            письменного заявления на адрес <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>

          <p>
            Я подтверждаю, что ознакомлен(а) с <Link href="/privacy">Политикой конфиденциальности</Link> и даю согласие
            на обработку персональных данных.
          </p>
        </LegalArticle>
      </ScrollReveal>
    </div>
  );
}
