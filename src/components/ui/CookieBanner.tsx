"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/lib/store/uiStore";

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const { cookieConsent, setCookieConsent } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || cookieConsent !== null) return null;

  return (
    <div className="fixed bottom-[calc(70px+env(safe-area-inset-bottom,0px))] left-4 right-4 z-[9999] rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xl motion-reduce:transition-none lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-md">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            Мы используем cookie для улучшения работы сайта.{" "}
            <Link
              href="/privacy"
              className="text-[var(--color-cherry)] underline underline-offset-2 transition-colors hover:text-[var(--paloma-burgundy)]"
            >
              Политика конфиденциальности
            </Link>
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCookieConsent("accepted")}
              className="flex-1 btn-primary text-xs py-2.5 px-4 justify-center"
            >
              Принять
            </button>
            <button
              type="button"
              onClick={() => setCookieConsent("rejected")}
              className="flex-1 btn-secondary text-xs py-2.5 px-4 justify-center"
            >
              Отклонить
            </button>
          </div>
    </div>
  );
}
