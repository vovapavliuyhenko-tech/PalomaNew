import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, H2 } from "@/components/ui/typography";

const primary =
  "inline-flex min-h-[52px] w-full shrink-0 items-center justify-center rounded-[var(--radius-button)] border-2 border-[var(--color-cream)] bg-[var(--color-cream)] px-10 font-[family-name:var(--font-body),sans-serif] text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-bordeaux)] shadow-[0_2px_14px_color-mix(in_srgb,var(--paloma-coal)_18%,transparent)] transition-[opacity,transform] hover:opacity-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)] sm:w-auto sm:min-w-[15rem]";

const secondary =
  "inline-flex min-h-[52px] w-full shrink-0 items-center justify-center rounded-[var(--radius-button)] border-2 border-[color-mix(in_srgb,var(--paloma-white)_96%,transparent)] bg-[color-mix(in_srgb,var(--paloma-white)_30%,transparent)] px-10 font-[family-name:var(--font-body),sans-serif] text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--paloma-white)_35%,transparent)] backdrop-blur-[3px] transition-colors hover:bg-[color-mix(in_srgb,var(--paloma-white)_42%,transparent)] hover:border-[var(--color-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)] sm:w-auto sm:min-w-[15rem]";

export default function WeddingsBlock() {
  return (
    <Section
      size="lg"
      tone="bordeaux"
      className="relative overflow-hidden border-b border-[color-mix(in_srgb,var(--paloma-white)_18%,transparent)] !pb-[clamp(4.25rem,11vw,8rem)] lg:!pb-[clamp(5.25rem,12vw,9.5rem)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/placeholders/product-3x4.svg"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-bordeaux)_72%,transparent)]"
          aria-hidden
        />
      </div>
      <Container className="relative z-[1]">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <H2 className="text-balance !leading-[1.14] text-[var(--color-cream)]">
            Свадебная флористика и оформление событий
          </H2>
          <Body className="mx-auto mt-8 max-w-none !leading-[1.72] text-[color-mix(in_srgb,var(--paloma-white)_90%,transparent)] sm:mt-10 sm:max-w-2xl lg:mx-0">
            От букета невесты до арки и столов: продумываем стиль пространства, работаем с площадкой и
            светом, привозим свежие материалы и монтируем в день события. Обсудим концепцию и смету без
            лишней суеты — пишите, если дата уже намечена.
          </Body>
        </div>
        <div className="mt-14 flex w-full flex-col gap-5 sm:mx-auto sm:mt-16 sm:max-w-xl sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-5 lg:mx-0 lg:mt-[4.25rem] lg:max-w-none lg:justify-start lg:gap-x-10">
          <Link href="/wedding#quote" className={primary}>
            Рассчитать оформление
          </Link>
          <Link href="/wedding" className={secondary}>
            Смотреть свадьбы
          </Link>
        </div>
      </Container>
    </Section>
  );
}
