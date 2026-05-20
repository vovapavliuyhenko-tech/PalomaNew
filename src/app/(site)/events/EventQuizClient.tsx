"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { analytics } from "@/lib/analytics";

const budgets = ["До 30 000 ₽", "30 000 — 80 000 ₽", "80 000 — 150 000 ₽", "От 150 000 ₽"];
const decor = [
  "Зал / основная площадка",
  "Столы гостей",
  "Арка / проход",
  "Фотозона",
  "Входная зона / ресепшн",
  "Украшение авто",
];

const inputClass =
  "w-full border border-[var(--border)] rounded-[var(--radius-small)] px-4 py-3 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] focus:outline-none focus:border-[var(--paloma-orange)] transition-colors placeholder:text-[var(--text-secondary)]/50";

const sel =
  "border-[var(--paloma-orange)] bg-[color-mix(in_srgb,var(--paloma-orange)_14%,var(--paloma-white))] text-[var(--text-primary)]";
const unsel =
  "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--paloma-orange)]/45";

export default function EventQuizClient() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    eventType: "",
    date: "",
    items: [] as string[],
    budget: "",
    name: "",
    phone: "",
    telegram: "",
    comment: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleToggleItem = (item: string) => {
    setData((d) => ({
      ...d,
      items: d.items.includes(item) ? d.items.filter((i) => i !== item) : [...d.items, item],
    }));
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/leads/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = (await res.json()) as { success?: boolean };

    if (!res.ok || !json.success) {
      window.alert("Не удалось отправить заявку. Попробуйте позже или напишите в Telegram.");
      return;
    }

    analytics.submitEventsLead();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-small)] p-8 text-center shadow-sm">
        <p className="text-4xl mb-4">🎉</p>
        <h3 className="text-2xl mb-3 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
          Заявка принята!
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Наш менеджер свяжется с вами в течение часа для уточнения деталей.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-small)] p-6 md:p-8 shadow-sm">
      <div className="flex gap-1 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-[var(--paloma-orange)]" : "bg-[var(--color-gray)]"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-lg mb-5 font-medium text-[var(--text-primary)]">Тип мероприятия</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {["Свадьба", "День рождения", "Корпоратив", "Другое"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setData((d) => ({ ...d, eventType: type }))}
                className={`py-3 border rounded-[var(--radius-small)] text-sm transition-all ${
                  data.eventType === type ? sel : unsel
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!data.eventType}
            className="btn-primary w-full justify-center disabled:opacity-40"
          >
            Далее <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg mb-5 font-medium text-[var(--text-primary)]">Дата мероприятия</h3>
          <input
            type="date"
            value={data.date}
            onChange={(e) => setData((d) => ({ ...d, date: e.target.value }))}
            className={`${inputClass} mb-8`}
          />
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} className="btn-secondary flex-1 justify-center">
              <ChevronLeft size={16} /> Назад
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!data.date}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              Далее <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg mb-2 font-medium text-[var(--text-primary)]">Что оформить?</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-5">Можно выбрать несколько пунктов</p>
          <div className="space-y-2 mb-6">
            {decor.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleToggleItem(item)}
                className={`w-full text-left px-4 py-3 border rounded-[var(--radius-small)] text-sm transition-all flex items-center gap-3 ${
                  data.items.includes(item) ? sel : unsel
                }`}
              >
                <span
                  className={`w-4 h-4 border rounded flex items-center justify-center ${
                    data.items.includes(item)
                      ? "bg-[var(--paloma-orange)] border-[var(--paloma-orange)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {data.items.includes(item) && (
                    <span className="text-[var(--text-on-dark)] text-xs">✓</span>
                  )}
                </span>
                {item}
              </button>
            ))}
          </div>

          <h4 className="text-sm font-medium mb-3 text-[var(--text-primary)]">Бюджет</h4>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {budgets.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setData((d) => ({ ...d, budget: b }))}
                className={`py-2.5 border rounded-[var(--radius-small)] text-xs transition-all ${
                  data.budget === b ? sel : unsel
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleBack} className="btn-secondary flex-1 justify-center">
              <ChevronLeft size={16} /> Назад
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={data.items.length === 0 || !data.budget}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              Далее <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="text-lg mb-5 font-medium text-[var(--text-primary)]">Контактные данные</h3>
          <div className="space-y-4 mb-8">
            <input
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              className={inputClass}
              placeholder="Ваше имя *"
            />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              className={inputClass}
              placeholder="+7 (999) 000-00-00 *"
            />
            <input
              value={data.telegram}
              onChange={(e) => setData((d) => ({ ...d, telegram: e.target.value }))}
              className={inputClass}
              placeholder="@telegram (необязательно)"
            />
            <textarea
              value={data.comment}
              onChange={(e) => setData((d) => ({ ...d, comment: e.target.value }))}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Дополнительные пожелания..."
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleBack} className="btn-secondary flex-1 justify-center">
              <ChevronLeft size={16} /> Назад
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!data.name || !data.phone}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              Отправить заявку
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
