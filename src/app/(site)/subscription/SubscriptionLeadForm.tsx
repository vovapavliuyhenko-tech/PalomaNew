"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

const plans = [
  {
    key: "lite",
    label: "Lite",
    price: 2900,
    freqWeeks: 1 as const,
    freqLabel: "раз в неделю",
    blurb: "Компактный букет для стола или тумбы",
  },
  {
    key: "classic",
    label: "Classic",
    price: 4500,
    freqWeeks: 1 as const,
    freqLabel: "раз в неделю",
    blurb: "Полноценный букет — частый выбор гостей PALOMA",
    popular: true,
  },
  {
    key: "premium",
    label: "Premium",
    price: 7500,
    freqWeeks: 1 as const,
    freqLabel: "раз в неделю",
    blurb: "Авторские объёмные работы сезона",
  },
  {
    key: "bimonthly",
    label: "Classic · 2× в месяц",
    price: 6500,
    freqWeeks: 2 as const,
    freqLabel: "2 раза в месяц",
    blurb: "Тот же Classic реже по графику",
  },
];

const inputClass =
  "w-full border border-[var(--border)] rounded-[var(--radius-small)] px-4 py-3 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] focus:outline-none focus:border-[var(--color-cherry)] transition-colors placeholder:text-[var(--text-secondary)]/50";

export default function SubscriptionLeadForm() {
  const [planKey, setPlanKey] = useState<(typeof plans)[number]["key"]>("classic");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [addVase, setAddVase] = useState(false);
  const [addSecateur, setAddSecateur] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const plan = plans.find((p) => p.key === planKey) ?? plans[1]!;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.label,
          price: plan.price,
          freqWeeks: plan.freqWeeks,
          freqLabel: plan.freqLabel,
          customerName: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          deliveryAddress: address.trim(),
          addVase,
          addSecateur,
          comment: comment.trim(),
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) {
        window.alert("Не удалось отправить заявку. Напишите нам в Telegram или позвоните.");
        return;
      }
      setDone(true);
    } catch {
      window.alert("Ошибка сети. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
        <p className="text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
          Заявка отправлена
        </p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Менеджер PALOMA свяжется с вами, чтобы согласовать старт подписки и доставку.
        </p>
      </div>
    );
  }

  return (
    <form
      id="subscription-lead"
      onSubmit={onSubmit}
      className="space-y-5 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8 shadow-sm"
    >
      <div>
        <h2 className="text-lg text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
          Заявка на подписку
        </h2>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Выберите тариф — мы подтвердим состав, ритм и адрес без обязательств до согласования.
        </p>
      </div>

      <div>
        <label className="mb-2 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
          Тариф
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {plans.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPlanKey(p.key)}
              className={`rounded-[var(--radius-small)] border px-3 py-3 text-left text-sm transition-colors ${
                planKey === p.key
                  ? "border-[var(--color-cherry)] bg-[color-mix(in_srgb,var(--paloma-orange)_14%,var(--paloma-white))]"
                  : "border-[var(--border)] hover:border-[var(--color-cherry)]/35"
              }`}
            >
              <span className="font-medium text-[var(--text-primary)]">{p.label}</span>
              <span className="block text-xs text-[var(--text-secondary)]">{p.blurb}</span>
              <span className="mt-1 block text-xs text-[var(--paloma-burgundy)]">
                {formatPrice(p.price)} / {p.freqLabel}
              </span>
              {p.popular ? (
                <span className="mt-1 inline-block rounded-full bg-[var(--color-cherry)]/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-on-dark)]">
                  часто выбирают
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
            Имя *
          </label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div>
          <label className="mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
            Телефон *
          </label>
          <input
            className={inputClass}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
            Email
          </label>
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
          Адрес доставки
        </label>
        <input
          className={inputClass}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Город, улица, подъезд, домофон"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input type="checkbox" checked={addVase} onChange={(e) => setAddVase(e.target.checked)} className="accent-[var(--color-cherry)]" />
          Удобная ваза к подписке
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={addSecateur}
            onChange={(e) => setAddSecateur(e.target.checked)}
            className="accent-[var(--color-cherry)]"
          />
          Секатор в подарок
        </label>
      </div>

      <div>
        <label className="mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
          Комментарий
        </label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Палитра, аллергии, вход во двор без пропуска…"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? "Отправка…" : "Отправить заявку"}
      </button>
    </form>
  );
}
