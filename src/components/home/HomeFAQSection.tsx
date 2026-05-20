"use client";

import Link from "next/link";
import FAQAccordion from "@/components/shared/FAQAccordion";

const items = [
  {
    question: "Можно ли заказать букет сегодня?",
    answer:
      "Да — у нас есть готовые позиции ниже по странице и полный каталог. Оформите заказ онлайн или напишите нам — поможем с выбором по сезону.",
  },
  {
    question: "Вы отправляете фото перед доставкой?",
    answer:
      "По желанию — отметьте это при заказе. Так вы видите результат до том, как букет уедет к получателю.",
  },
  {
    question: "Как ухаживать за букетом после доставки?",
    answer:
      "Смена воды, лёгкий срез стеблей под углом, прохладное место без сквозняков. Подробности — на странице «Уход за букетом».",
  },
  {
    question: "Какие способы оплаты у вас есть?",
    answer: "Карта, СБП и Яндекс Pay — через защищённую форму после заполнения заказа.",
  },
  {
    question: "Я не знаю, какой букет выбрать. Вы поможете?",
    answer:
      "Да — напишите в Telegram или позвоните. Подстроим палитру, размер и настроение без спешки. Раздел «Готовые сегодня» тоже удобен, когда нужно решение быстро.",
  },
];

export default function HomeFAQSection() {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-card)] py-14 lg:py-20">
      <div className="container mx-auto">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--color-cherry)]" style={{ fontFamily: "var(--font-accent)" }}>
              Вопрос и ответ
            </p>
            <h2 className="text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
              Частые вопросы
            </h2>
            <p className="mt-3 max-w-lg text-sm text-[var(--text-secondary)]">
              Спокойно и по делу — без давления на выбор.
            </p>
          </div>
          <Link href="/faq" className="btn-secondary shrink-0">
            Все вопросы
          </Link>
        </div>
        <FAQAccordion items={items} />
      </div>
    </section>
  );
}
