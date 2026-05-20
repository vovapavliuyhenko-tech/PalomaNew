import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, Caption, H2 } from "@/components/ui/typography";

const ITEMS = [
  {
    title: "Свежесть",
    text: "Закупаем цветы регулярно и храним по стандартам студии — букет приезжает собранным «на сейчас».",
  },
  {
    title: "Честность состава",
    text: "Если сезон заменит оттенок — предупредим и сохраним характер композиции, а не «похожий силуэт».",
  },
  {
    title: "Фото перед доставкой",
    text: "По запросу отправляем кадр готового букета до выезда курьера — особенно для важных дат.",
  },
  {
    title: "Поддержка после покупки",
    text: "Подскажем по уходу, повторному срезу и воде — чтобы радость длилась дольше.",
  },
] as const;

export default function Guarantee() {
  return (
    <Section
      size="lg"
      tone="cream"
      className="!border-b-0 !pt-[clamp(4rem,11vw,7.75rem)] lg:!pt-[clamp(5rem,12vw,9.5rem)]"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <H2 className="text-balance !leading-[1.15] text-[var(--color-text-graphite)] md:!text-[clamp(28px,3.2vw,40px)]">
            Мы заботимся о каждом букете
          </H2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-x-7 sm:gap-y-7 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {ITEMS.map((item, i) => (
            <article
              key={item.title}
              className="flex h-full min-h-[17.5rem] flex-col rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--paloma-coal)_12%,transparent)] bg-[var(--color-bg-ivory)] p-8 shadow-[var(--shadow-soft)] md:min-h-[18rem] md:p-9"
            >
              <Caption className="text-[var(--color-accent-burgundy)]">0{i + 1}</Caption>
              <h3 className="mt-6 font-[family-name:var(--font-display),serif] text-[clamp(1.125rem,1.5vw,1.28rem)] font-normal leading-[1.28] tracking-[-0.02em] text-[var(--color-text-graphite)]">
                {item.title}
              </h3>
              <Body className="mt-5 max-w-none flex-1 !text-[15px] !leading-[1.72] text-[color-mix(in_srgb,var(--paloma-coal)_54%,transparent)]">
                {item.text}
              </Body>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
