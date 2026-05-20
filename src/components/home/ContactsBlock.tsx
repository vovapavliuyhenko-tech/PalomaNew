import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, Caption, H2 } from "@/components/ui/typography";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";
import { ADDRESS } from "@/lib/constants";
import { siteConfig } from "@/lib/siteConfig";

const primary =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-ink)] bg-[var(--color-ink)] px-8 font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-cream)] transition-opacity hover:opacity-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] lg:max-w-xs";

const secondary =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-ink)_28%,transparent)] bg-transparent px-6 font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] lg:max-w-xs";

const ghost =
  "inline-flex min-h-12 w-full items-center justify-center border-0 bg-transparent font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)] underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] lg:w-auto";

export default function ContactsBlock() {
  return (
    <Section
      size="lg"
      tone="milk"
      className="border-t-2 border-[color-mix(in_srgb,var(--paloma-coal)_8%,transparent)] !border-b-0"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-stretch lg:gap-20 xl:gap-24">
          <div className="flex flex-col justify-center gap-8 lg:max-w-xl lg:justify-self-center xl:max-w-none xl:justify-self-start">
            <div className="space-y-6 text-center lg:text-left">
              <H2 className="text-balance !leading-[1.12] text-[var(--color-text-graphite)]">
                Заходите в гости
              </H2>
              <Body className="mx-auto max-w-none !leading-[1.72] text-[color-mix(in_srgb,var(--paloma-coal)_52%,transparent)] lg:mx-0">
                {ADDRESS}. Рядом с центральным пляжем — удобно забрать заказ или встретиться с курьером.
              </Body>
              <Caption className="block text-[color-mix(in_srgb,var(--paloma-coal)_48%,transparent)]">
                Режим: {siteConfig.workingHours}
              </Caption>
            </div>

            <div className="flex flex-col gap-4 lg:mx-0">
              <a
                href={siteConfig.maps}
                target="_blank"
                rel="noopener noreferrer"
                className={primary}
              >
                Построить маршрут
              </a>
              <TrackOutboundAnchor
                href={siteConfig.whatsapp}
                kind="whatsapp"
                source="home_contacts"
                target="_blank"
                rel="noopener noreferrer"
                className={secondary}
              >
                Написать в WhatsApp
              </TrackOutboundAnchor>
              <TrackOutboundAnchor
                href={siteConfig.telegram}
                kind="telegram"
                source="home_contacts"
                target="_blank"
                rel="noopener noreferrer"
                className={secondary}
              >
                Написать в Telegram
              </TrackOutboundAnchor>
              <a href={`tel:${siteConfig.phoneTel}`} className={`${ghost} justify-center lg:justify-start`}>
                Позвонить
              </a>
            </div>
          </div>

          <div
            className="flex min-h-[280px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-ivory)_88%,var(--color-accent-floral))] p-10 text-center lg:h-auto lg:min-h-[360px]"
            role="img"
            aria-label="Заглушка карты — подключим Яндекс.Карты позже"
          >
            <Caption className="text-[color-mix(in_srgb,var(--paloma-coal)_42%,transparent)]">Карта</Caption>
            <p className="mt-3 max-w-[14rem] font-[family-name:var(--font-body),sans-serif] text-sm leading-relaxed text-[color-mix(in_srgb,var(--paloma-coal)_38%,transparent)]">
              Скоро подключим карту проезда к студии на Энгельса
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
