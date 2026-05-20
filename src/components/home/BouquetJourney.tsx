"use client";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, Caption, H2 } from "@/components/ui/typography";

const STEPS = [
  {
    n: "01",
    title: "Заявка и пожелания",
    text: "Уточняем повод, палитру, бюджет и способ доставки — в мессенджере или по телефону.",
  },
  {
    n: "02",
    title: "Подбор цветов",
    text: "Флористы собирают свежие сорта дня — с учётом сезона и вашего настроения.",
  },
  {
    n: "03",
    title: "Сборка композиции",
    text: "Формируем объём, текстуру и баланс; при необходимости согласуем фото перед отправкой.",
  },
  {
    n: "04",
    title: "Упаковка и доводка",
    text: "Аккуратная фирменная упаковка, открытка и опционально кофе или десерт из витрины.",
  },
  {
    n: "05",
    title: "Доставка или самовывоз",
    text: "Привозим в интервал, передаём получателю бережно или ждём вас в студии на Энгельса.",
  },
];

export default function BouquetJourney() {
  return (
    <Section size="lg" tone="ink" className="!py-[clamp(3.75rem,10vw,7.5rem)] lg:!py-[var(--section-py-desktop)]">
      <Container>
        <H2 className="max-w-none text-[var(--color-cream)] sm:max-w-3xl !leading-[1.12]">
          Как мы готовим букет к отправке
        </H2>
        <Body className="mt-6 max-w-none text-pretty !leading-[1.72] text-[color-mix(in_srgb,var(--paloma-white)_74%,transparent)] sm:max-w-2xl md:mt-8">
          Пять шагов — от вашего запроса до свежей композиции в руках получателя.
        </Body>

        <div className="paloma-steps-grid mt-12 md:mt-16">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="flex h-full min-h-[17rem] min-w-0 flex-col gap-5 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-cream)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-ink)_82%,var(--paloma-burgundy)_8%)] p-7 shadow-[0_1px_0_color-mix(in_srgb,var(--color-cream)_12%,transparent)_inset] md:min-h-[18rem] md:p-8"
            >
              <Caption className="block text-[var(--color-orange)]">{step.n}</Caption>
              <h3 className="font-[family-name:var(--font-display),serif] text-[clamp(1.125rem,1.9vw,1.3rem)] leading-[1.22] tracking-[-0.02em] text-[var(--color-cream)]">
                {step.title}
              </h3>
              <p className="mt-auto font-[family-name:var(--font-body),sans-serif] text-[15px] leading-[1.68] text-[color-mix(in_srgb,var(--paloma-white)_76%,transparent)]">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
