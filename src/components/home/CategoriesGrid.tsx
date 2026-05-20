import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { H2, H3 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type CategoryCardProps = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt?: string;
};

export function CategoryCard({ title, href, imageSrc, imageAlt = "" }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] bg-[var(--color-bg-ivory)] transition-shadow duration-300 hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--color-ink)_7%,transparent)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-milk)]">
        <Image
          src={imageSrc}
          alt={imageAlt || title}
          fill
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <span className="pointer-events-none absolute right-3 top-3 text-[var(--color-ink)] transition-transform duration-300 group-hover:translate-x-1">
          <ArrowRight className="size-5" strokeWidth={1.25} aria-hidden />
        </span>
      </div>
      <div className="p-4">
        <H3 className="!text-[clamp(1.15rem,2vw,1.35rem)] text-[var(--color-ink)]">{title}</H3>
      </div>
    </Link>
  );
}

const KEY_CATEGORIES: { title: string; href: string; image: string }[] = [
  { title: "Букеты", href: "/catalog/bukety", image: "/images/placeholders/square-1x1.svg" },
  { title: "Композиции", href: "/catalog/kompozicii", image: "/images/placeholders/square-1x1.svg" },
  { title: "Монобукеты", href: "/catalog/mono", image: "/images/placeholders/square-1x1.svg" },
  { title: "Онлайн-витрина", href: "/catalog/online-vitrina", image: "/images/placeholders/square-1x1.svg" },
  { title: "Вазы и подарки", href: "/gifts", image: "/images/placeholders/square-1x1.svg" },
  { title: "Кофе и десерты", href: "/catalog/coffee-desserts", image: "/images/placeholders/square-1x1.svg" },
  { title: "Свадебная флористика", href: "/wedding", image: "/images/placeholders/square-1x1.svg" },
  { title: "Оформление мероприятий", href: "/events", image: "/images/placeholders/square-1x1.svg" },
];

export default function CategoriesGrid() {
  return (
    <Section size="lg" tone="cream">
      <Container>
        <H2 className="max-w-3xl text-[var(--color-ink)]">Найдите свой формат</H2>
        <div className="mt-10 grid grid-cols-1 gap-[clamp(20px,2vw,28px)] sm:grid-cols-2 lg:grid-cols-4">
          {KEY_CATEGORIES.map((c) => (
            <CategoryCard key={c.href} title={c.title} href={c.href} imageSrc={c.image} imageAlt="" />
          ))}
        </div>
      </Container>
    </Section>
  );
}
