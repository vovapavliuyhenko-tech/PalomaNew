import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LegalArticle from "@/components/layout/LegalArticle";
import { siteConfig } from "@/lib/siteConfig";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${siteConfig.legalName}`,
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Политика конфиденциальности", path: "/privacy" },
        ]}
      />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Политика конфиденциальности" }]}
        title="Политика конфиденциальности"
        maxWidthClass="max-w-4xl"
      />
      <ScrollReveal>
        <LegalArticle meta="Последнее обновление: 1 января 2026 года">
          <h2>1. Общие положения</h2>
          <p>
            ИП {siteConfig.legalName} (далее — «Оператор») обязуется защищать персональные данные пользователей
            сайта {new URL(siteConfig.siteUrl).hostname} в соответствии с Федеральным законом №152-ФЗ «О персональных
            данных».
          </p>

          <h2>2. Какие данные мы собираем</h2>
          <ul>
            <li>Имя и фамилия</li>
            <li>Номер телефона</li>
            <li>Адрес электронной почты</li>
            <li>Telegram username</li>
            <li>Адрес доставки</li>
            <li>Данные о заказах</li>
          </ul>

          <h2>3. Цели обработки данных</h2>
          <p>
            Данные используются исключительно для: оформления и выполнения заказов, уведомления о статусе заказа,
            улучшения качества сервиса.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Сайт использует файлы cookie для аналитики (Яндекс.Метрика) и улучшения работы. Вы можете отказаться от
            cookies в настройках браузера или при появлении баннера.
          </p>

          <h2>5. Ваши права</h2>
          <p>
            Вы вправе запросить доступ, изменение или удаление ваших данных, написав на{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>

          <h2>6. Контакты</h2>
          <p>
            ИП {siteConfig.legalName} · {siteConfig.address} · {siteConfig.email}
          </p>
        </LegalArticle>
      </ScrollReveal>
    </div>
  );
}
