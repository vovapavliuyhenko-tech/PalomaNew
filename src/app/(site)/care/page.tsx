import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Apple, Droplets, Scissors, ThermometerSun, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { definePageMeta } from "@/lib/seo";

export const metadata: Metadata = definePageMeta({
  title: `Уход за букетом — ${siteConfig.legalName}`,
  description: "Советы по уходу за срезанными цветами. Как продлить жизнь вашего букета.",
  path: "/care",
});

const tips: { icon: LucideIcon; title: string; tips: string[] }[] = [
  {
    icon: Droplets,
    title: "Вода",
    tips: [
      "Меняйте воду каждые 2 дня, используя чистую прохладную воду",
      "Добавляйте 1/4 таблетки аспирина или специальную питательную смесь",
      "Уровень воды должен покрывать стебли на 5–7 см",
    ],
  },
  {
    icon: Scissors,
    title: "Обрезка стеблей",
    tips: [
      "Обрезайте стебли под углом 45° каждые 2 дня",
      "Используйте острый нож или ножницы",
      "Обрезайте под водой, чтобы не попал воздух в стебель",
    ],
  },
  {
    icon: ThermometerSun,
    title: "Температура и место",
    tips: [
      "Держите букет вдали от прямых солнечных лучей",
      "Оптимальная температура: 15–20°C",
      "Не ставьте рядом с батареями и кондиционерами",
    ],
  },
  {
    icon: Apple,
    title: "Не рядом с фруктами",
    tips: [
      "Фрукты (особенно бананы и яблоки) выделяют этилен, ускоряющий увядание",
      "Держите букет в другой комнате от фруктовой вазы",
    ],
  },
];

const byFlower: Record<string, string> = {
  Розы: "Снимайте внешние лепестки, если они повреждены. Делайте косой срез каждый день.",
  Пионы: "Покупайте в бутонах — они будут раскрываться 2–3 дня. Поставьте в прохладное место.",
  Тюльпаны: "Любят холодную воду. Можно обернуть бумагой на ночь — будут ровнее.",
  Лилии: "Удалите тычинки — они красят пыльцой. Не ставьте рядом с кошками!",
  Хризантемы: "Самые стойкие — стоят до 2 недель. Меняйте воду каждые 3 дня.",
};

export default function CarePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Уход за букетом", path: "/care" },
        ]}
      />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Уход за букетом" }]}
        eyebrow={siteConfig.name}
        title="Уход за букетом"
        lead="Семь базовых правил и разбор по видам цветов — чтобы срез простоял дольше."
      />

      <ScrollReveal>
      <div className="container mx-auto max-w-5xl py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="mb-14 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-soft)] md:p-8">
          <h2 className="mb-5 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 400 }}>
            Семь правил
          </h2>
          <ol className="list-decimal space-y-2 pl-5 font-accent text-sm leading-relaxed text-[var(--text-secondary)]">
            <li>Свежая прохладная вода и смена каждые 1–2 дня.</li>
            <li>Косой срез стеблей острым ножом или секатором при каждой смене воды.</li>
            <li>Нейтральная температура 15–22 °C: без батарей, прямого солнца и сквозняков.</li>
            <li>Чистая ваза: сполосните от слизи, не добавляйте воду «сверху старой».</li>
            <li>Питание для срезки или четверть таблетки аспирина — по инструкции на упаковке.</li>
            <li>Не ставьте рядом с фруктами — этилен ускоряет увядание.</li>
            <li>При переноске берегите от тепла и тряски; в машине не оставляйте на солнцепёке.</li>
          </ol>
        </div>

        <h2 className="mb-6 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
          Подробнее по темам
        </h2>
        <div className="grid md:grid-cols-2 gap-[var(--space-lg)] mb-14">
          {tips.map((tip) => (
            <div
              key={tip.title}
              className="bg-[var(--bg-secondary)] border border-[var(--color-line)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-soft)] transition-shadow duration-[var(--dur-slow)] ease-[var(--ease-soft)] hover:shadow-[var(--shadow-card)]"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--bg-card)]">
                <tip.icon size={20} className="text-[var(--color-cherry)]" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="text-xl mb-3 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                {tip.title}
              </h3>
              <ul className="space-y-2">
                {tip.tips.map((t) => (
                  <li key={t} className="text-sm text-[var(--text-secondary)] flex gap-2">
                    <span className="text-[var(--color-cherry)] mt-0.5">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="mb-6 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
          Особенности ухода по видам цветов
        </h2>
        <div className="space-y-3">
          {Object.entries(byFlower).map(([flower, advice]) => (
            <div
              key={flower}
              className="border border-[var(--color-line)] rounded-[var(--radius-md)] p-5 bg-[var(--bg-card)] shadow-[var(--shadow-soft)]"
            >
              <p className="font-medium text-[var(--text-primary)] mb-1">{flower}</p>
              <p className="text-sm text-[var(--text-secondary)]">{advice}</p>
            </div>
          ))}
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
