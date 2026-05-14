"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Heart } from "lucide-react";
import { analytics } from "@/lib/analytics";

const schema = z.object({
  coupleName: z.string().min(3, "Минимум 3 символа"),
  weddingDate: z.string().min(1, "Выберите дату"),
  phone: z.string().min(11, "Введите корректный телефон"),
  telegram: z.string().optional(),
});

type PiggybankFormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--color-cherry)] focus:outline-none";
const labelClass =
  "mb-1.5 block text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]";
const errorClass = "mt-1 text-xs text-red-500";

export default function WeddingPiggybankClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PiggybankFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: PiggybankFormValues) => {
    setSubmitErr(null);
    try {
      const res = await fetch("/api/leads/wedding-piggybank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleName: values.coupleName,
          weddingDate: values.weddingDate,
          phone: values.phone,
          telegram: values.telegram?.trim() || undefined,
        }),
      });
      const payload = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (res.ok && payload?.success) {
        analytics.submitWeddingForm();
        setSubmitted(true);
        return;
      }
    } catch {
      /* fall through */
    }
    setSubmitErr("Не удалось отправить заявку. Попробуйте позже или напишите нам в Telegram.");
  };

  return (
    <div className="container mx-auto max-w-5xl border-t border-[var(--border)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
      <p className="font-accent mb-3 text-xs uppercase tracking-[var(--ls-wider)] text-[var(--text-secondary)]">
        Заявка
      </p>
      <h2
        className="mb-10 text-[var(--text-primary)]"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
          letterSpacing: "-0.02em",
          fontWeight: 400,
          lineHeight: 1.15,
        }}
      >
        Гостям и молодожёнам
      </h2>

      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6 md:p-8">
          <p
            className="font-accent mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-cherry)]"
          >
            Для гостей
          </p>
          <h3
            className="mb-4 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 400 }}
          >
            Подарите молодожёнам цветы
          </h3>
          <p className="font-accent mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
            Если у вас есть ссылка на копилку пары, перейдите по ней, чтобы пополнить депозит. Ваш подарок
            превратится в прекрасные цветы.
          </p>
          <div className="rounded-[var(--radius-medium)] border border-[var(--color-cherry)]/25 bg-[var(--bg-card)]/90 p-4">
            <p className="font-accent mb-2 text-xs text-[var(--text-secondary)]">Введите код копилки</p>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
                placeholder="PALOMA-XXXX"
              />
              <button type="button" className="btn-primary shrink-0 px-4 py-2 text-sm">
                Найти
              </button>
            </div>
          </div>
        </div>

        <div>
          <p
            className="font-accent mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-cherry)]"
          >
            Для молодожёнов
          </p>
          <h3
            className="mb-6 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 400 }}
          >
            Создать свою копилку
          </h3>

          {submitted ? (
            <div className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
              <div className="mb-4 flex justify-center text-[var(--color-cherry)]" aria-hidden>
                <Heart size={28} strokeWidth={1.5} className="fill-[color-mix(in_srgb,var(--paloma-orange)_15%,transparent)]" />
              </div>
              <p className="mb-1 font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-accent)" }}>
                Заявка отправлена!
              </p>
              <p className="font-accent text-sm leading-relaxed text-[var(--text-secondary)]">
                Мы свяжемся с вами в ближайшее время для создания вашей копилки.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {submitErr ? <p className={errorClass}>{submitErr}</p> : null}
              <div>
                <label className={labelClass} htmlFor="piggy-couple">
                  Имена пары *
                </label>
                <input
                  id="piggy-couple"
                  {...register("coupleName")}
                  className={inputClass}
                  placeholder="Александр и Мария"
                />
                {errors.coupleName && <p className={errorClass}>{errors.coupleName.message}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="piggy-date">
                  Дата свадьбы *
                </label>
                <input id="piggy-date" type="date" {...register("weddingDate")} className={inputClass} />
                {errors.weddingDate && <p className={errorClass}>{errors.weddingDate.message}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="piggy-phone">
                  Телефон *
                </label>
                <input
                  id="piggy-phone"
                  type="tel"
                  {...register("phone")}
                  className={inputClass}
                  placeholder="+7 (999) 000-00-00"
                />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="piggy-tg">
                  Telegram
                </label>
                <input id="piggy-tg" {...register("telegram")} className={inputClass} placeholder="@username" />
              </div>

              <button type="submit" className="btn-primary w-full justify-center">
                Создать копилку
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
