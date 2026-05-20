import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, Caption, H2 } from "@/components/ui/typography";

export default function About() {
  return (
    <Section size="lg" tone="milk">
      <Container>
        <Caption className="text-[var(--color-ink)]/55">О НАС</Caption>
        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-start">
          <H2 className="min-w-0 !leading-[1.12] text-[var(--color-ink)]">
            Paloma — это цветы, кофе и моменты у моря
          </H2>
          <div className="min-w-0 space-y-8">
            <Body className="max-w-none !leading-[1.72] text-[var(--color-ink)]/85">
              Мы собираем букеты как маленькие истории: с вниманием к детали, сезону и настроению. В Paloma
              цветы соседствуют с кофейней — можно зайти за букетом, остаться на латте и уехать с хорошим
              послевкусием дня.
            </Body>
            <Body className="max-w-none !leading-[1.72] text-[var(--color-ink)]/85">
              Наша студия на Энгельса — это про тишину выбора без суеты и про заботу на каждом этапе: от
              заказа до вручения. Рядом с центральным пляжем — удобно забрать и легко встретить курьера.
            </Body>
          </div>
        </div>
      </Container>
    </Section>
  );
}
