"use client";

import Link from "next/link";

import ProductCard from "@/components/catalog/ProductCard";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, H2 } from "@/components/ui/typography";
import type { MockProduct } from "@/data/mockProducts";

type ShowcaseProps = {
  products: MockProduct[];
};

const ghostLink =
  "inline-flex min-h-12 items-center justify-center border-0 bg-transparent font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)] underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]";

export default function Showcase({ products }: ShowcaseProps) {
  return (
    <Section size="lg" tone="cream">
      <Container>
        <H2 className="max-w-3xl text-[var(--color-ink)]">Онлайн-витрина Paloma</H2>
        <Body className="mt-4 max-w-2xl text-[var(--color-ink)]/80">
          Готовые букеты и композиции для быстрого заказа — собираем в день доставки по Новороссийску и
          побережью.
        </Body>
        <div className="catalog-product-grid mt-12 md:mt-14">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 flex justify-center md:justify-start">
          <Link href="/catalog/online-vitrina" className={ghostLink}>
            Смотреть всю витрину
          </Link>
        </div>
      </Container>
    </Section>
  );
}
