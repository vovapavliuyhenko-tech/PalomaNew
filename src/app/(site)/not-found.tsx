import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Страница не найдена" }]}
        title="Страница не найдена"
        lead="Ссылка устарела или адрес введён с ошибкой. Загляните в каталог или на главную — мы подскажем по маршруту."
      />
      <ScrollReveal>
        <div className="container mx-auto max-w-xl py-[var(--space-lg)] md:pb-[var(--space-xxl)]">
          <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-8 shadow-[var(--shadow-soft)] sm:flex-row sm:flex-wrap sm:justify-center md:p-10">
            <Link href="/catalog" className="btn-primary inline-flex justify-center sm:min-w-[200px]">
              В каталог
            </Link>
            <Link href="/" className="btn-secondary inline-flex justify-center sm:min-w-[200px]">
              На главную
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
