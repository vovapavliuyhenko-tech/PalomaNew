"use client";

import Link from "next/link";
import { PRIMARY_NAV_PUBLIC, CLIENT_NAV_LINKS } from "@/lib/constants";

type NavigationProps = {
  /** Классы для ссылок верхней линии (десктоп шапка / админ-хелпер) */
  linkClassName?: string;
  ariaLabel?: string;
};

/** Длинный список навигации для футера, админ-заглушек и secondary-меню без дубля констант. */
export function NavigationColumn({ linkClassName, ariaLabel = "Разделы" }: NavigationProps) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-2">
      {PRIMARY_NAV_PUBLIC.map((l) => (
        <Link key={l.href} href={l.href} className={linkClassName}>
          {l.label}
        </Link>
      ))}
      <span className="sr-only block h-px w-px opacity-0" aria-hidden />
      {CLIENT_NAV_LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={linkClassName}>
          {l.label}
        </Link>
      ))}
      <Link href="/subscription" className={linkClassName}>
        Подписка
      </Link>
      <Link href="/gifts" className={linkClassName}>
        Вазы и подарки
      </Link>
      <Link href="/about" className={linkClassName}>
        О нас
      </Link>
      <Link href="/contacts" className={linkClassName}>
        Контакты
      </Link>
      <Link href="/cart" className={linkClassName}>
        Корзина
      </Link>
    </nav>
  );
}
