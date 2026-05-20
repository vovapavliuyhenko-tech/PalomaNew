"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { analytics } from "@/lib/analytics";
import { WEDDING_BUDGET_BRACKETS, WEDDING_QUOTE_SERVICE_OPTIONS } from "@/data/wedding-content";

const quoteSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().min(10, "Укажите телефон"),
  telegram: z.string().optional(),
  weddingDate: z.string().min(1, "Выберите дату"),
  venue: z.string().optional(),
  guestCount: z.string().optional(),
  services: z.array(z.string()).min(1, "Выберите хотя бы одну услугу"),
  budget: z.string().min(1, "Укажите бюджет"),
  comment: z.string().max(2000).optional(),
});

type QuoteForm = z.infer<typeof quoteSchema>;

const inputClass =
  "w-full rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--color-cherry)] focus:outline-none";
const labelClass =
  "mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]";
const errorClass = "text-xs text-red-500 mt-1";

export default function WeddingQuoteClient() {
  const [done, setDone] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      phone: "",
      telegram: "",
      weddingDate: "",
      venue: "",
      guestCount: "",
      services: [],
      budget: "",
      comment: "",
    },
  });

  const onSubmit = async (data: QuoteForm) => {
    const res = await fetch("/api/leads/wedding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = (await res.json()) as { success?: boolean };
    if (!res.ok || !json.success) {
      window.alert("Не удалось отправить заявку. Попробуйте позже или напишите в Telegram.");
      return;
    }

    analytics.submitWeddingForm();
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center shadow-[var(--shadow-soft)] md:p-10">
        <p className="mb-4 text-4xl" aria-hidden>
          💐
        </p>
        <h3
          className="mb-3 text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 400 }}
        >
          Заявка отправлена
        </h3>
        <p className="font-accent mx-auto max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
          Менеджер свяжется с вами, чтобы уточнить детали и подготовить ориентир по смете.
        </p>
        <Link href="/contacts" className="btn-secondary mt-8 inline-flex justify-center">
          Контакты салона
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-soft)] md:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Имя *</label>
          <input {...register("name")} className={inputClass} placeholder="Анна" autoComplete="name" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Телефон *</label>
          <input {...register("phone")} className={inputClass} placeholder="+7 …" type="tel" autoComplete="tel" />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Telegram</label>
        <input {...register("telegram")} className={inputClass} placeholder="@username (по желанию)" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Дата свадьбы *</label>
          <input {...register("weddingDate")} className={inputClass} type="date" />
          {errors.weddingDate && <p className={errorClass}>{errors.weddingDate.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Примерно гостей</label>
          <input {...register("guestCount")} className={inputClass} placeholder="Напр. 80" inputMode="numeric" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Площадка</label>
        <input {...register("venue")} className={inputClass} placeholder="Ресторан, отель, улица…" />
      </div>

      <div>
        <p className={`${labelClass} mb-3`}>Интересующие услуги *</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {WEDDING_QUOTE_SERVICE_OPTIONS.map((title) => (
            <label
              key={title}
              className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-small)] border border-[var(--border)] bg-[var(--bg-primary)]/50 px-3 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--color-cherry)]/35"
            >
              <Controller
                name="services"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--color-cherry)]"
                    checked={field.value.includes(title)}
                    onChange={() => {
                      const next = field.value.includes(title)
                        ? field.value.filter((x) => x !== title)
                        : [...field.value, title];
                      field.onChange(next);
                    }}
                  />
                )}
              />
              <span className="font-accent leading-snug">{title}</span>
            </label>
          ))}
        </div>
        {errors.services && <p className={errorClass}>{errors.services.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Бюджет на оформление *</label>
        <select {...register("budget")} className={inputClass} defaultValue="">
          <option value="" disabled>
            Выберите вариант
          </option>
          {WEDDING_BUDGET_BRACKETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {errors.budget && <p className={errorClass}>{errors.budget.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Комментарий</label>
        <textarea
          {...register("comment")}
          className={`${inputClass} min-h-[100px] resize-none`}
          placeholder="Палитра, пожелания, ссылки на референсы…"
        />
        {errors.comment && <p className={errorClass}>{errors.comment.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center disabled:opacity-60">
        {isSubmitting ? "Отправка…" : "Отправить заявку"}
      </button>
    </form>
  );
}
