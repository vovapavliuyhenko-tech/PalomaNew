import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { FadeIn } from "@/components/motion/FadeIn";
import { HorizontalScroll } from "@/components/motion/HorizontalScroll";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { IconButton } from "@/components/ui/IconButton";
import {
  ArrowRight,
  Menu,
  Phone,
  ShoppingBag,
} from "@/components/ui/icons";
import { IconInstagram, IconTelegram, IconWhatsapp } from "@/components/ui/icons/social";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Body, Caption, H1, H2, H3 } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Design system",
  description: "Витрина UI Paloma — только для разработки.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] pb-[var(--section-lg)]">
      <Section size="lg" tone="cream" className="!pt-8">
        <Container>
          <FadeIn>
            <Caption className="text-[var(--color-ink)]/60">Paloma / этап 3</Caption>
            <H1 className="mt-2 text-[var(--color-ink)]">Design system</H1>
            <Body className="mt-4 max-w-2xl text-[var(--color-ink)]/80">
              Типографика, примитивы форм и цвета бренда. Страница с noindex для
              production preview.
            </Body>
          </FadeIn>
        </Container>
      </Section>

      <Section size="md" tone="ink">
        <Container>
          <H2 className="text-[var(--color-cream)]">Типографика</H2>
          <div className="mt-8 space-y-6">
            <H3 as="div" className="text-[var(--color-cream)]">
              H3 на тёмном фоне
            </H3>
            <Body className="text-[var(--color-cream)]/85">
              Body: основной текст на бордовом или угольном фоне сохраняет контраст.
            </Body>
            <Caption className="text-[var(--color-cream)]/70">Caption · uppercase</Caption>
          </div>
        </Container>
      </Section>

      <Section size="md" tone="cream">
        <Container>
          <H2>Кнопки</H2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost link</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>

          <H3 className="mt-14">Иконки</H3>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[var(--color-ink)]">
            <IconButton aria-label="Меню" type="button">
              <Menu className="size-5" />
            </IconButton>
            <IconButton aria-label="Корзина" type="button">
              <ShoppingBag className="size-5" />
            </IconButton>
            <Phone className="size-5" aria-hidden />
            <IconWhatsapp className="size-5" />
            <IconTelegram className="size-5" />
            <IconInstagram className="size-5" aria-hidden />
            <ArrowRight className="size-5" aria-hidden />
          </div>
        </Container>
      </Section>

      <Section size="md" tone="peach">
        <Container>
          <H2>Поля ввода · underline</H2>
          <div className="mt-10 grid max-w-xl gap-10">
            <Input label="Имя" name="ds-name" placeholder="Как к вам обращаться" />
            <Textarea
              label="Комментарий"
              name="ds-note"
              placeholder="Пожелания к букету"
              rows={4}
            />
            <Select label="Город" name="ds-city" defaultValue="">
              <option value="" disabled>
                Выберите город
              </option>
              <option value="novorossiysk">Новороссийск</option>
              <option value="gelen">Геленджик</option>
            </Select>
            <Input label="С ошибкой" name="ds-err" error="Заполните поле" />
          </div>

          <div className="mt-12 grid gap-6 md:max-w-lg">
            <Checkbox name="ds-agree" label="Согласен с условиями доставки" />
            <Radio name="ds-pay" value="card" label="Карта онлайн" defaultChecked />
            <Radio name="ds-pay" value="sbp" label="СБП" />
          </div>
        </Container>
      </Section>

      <Section size="md" tone="cream">
        <Container>
          <H2>Бейджи</H2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge catalogKind="bestseller">Bestseller</Badge>
            <Badge catalogKind="seasonal">Seasonal</Badge>
            <Badge catalogKind="online">Online</Badge>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
          </div>
        </Container>
      </Section>

      <Section size="md" tone="bordeaux">
        <Container>
          <H2 className="text-[var(--color-cream)]">Цвета · токены</H2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {[
              ["cream", "var(--color-cream)"],
              ["ink", "var(--color-ink)"],
              ["bordeaux", "var(--color-bordeaux)"],
      ["orange", "var(--color-orange)"],
              ["rose", "var(--color-rose)"],
              ["peach", "var(--color-peach)"],
            ].map(([name, col]) => (
              <div
                key={name as string}
                className="border border-[var(--color-cream)]/20"
              >
                <div className="h-16" style={{ background: col as string }} />
                <Caption className="block p-2 text-[var(--color-cream)]">
                  {name as string}
                </Caption>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section size="md" tone="cream">
        <Container>
          <H2>Motion</H2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <FadeIn delay={0.1}>
              <Body>FadeIn — появление при скролле (Framer Motion).</Body>
            </FadeIn>
            <div className="aspect-[3/4] max-h-[360px] w-full overflow-hidden bg-[var(--color-peach)]">
              <ParallaxImage
                src="/images/placeholders/product-3x4.svg"
                alt=""
                width={600}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <HorizontalScroll className="mt-8 border border-dashed border-[var(--color-ink)]/25 p-6">
            <Caption>HorizontalScroll — заглушка до этапа 15</Caption>
          </HorizontalScroll>
        </Container>
      </Section>
    </div>
  );
}
